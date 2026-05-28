const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");
const {getResendClient} = require("./resendClient");
const {getTemplate} = require("./templates");
const {isValidEmail} = require("./validators");

const FROM_ADDRESS = "Paul's Kitchen <onboarding@resend.dev>";

function getDb() {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
  return admin.firestore();
}

async function logMail(entry) {
  try {
    await getDb().collection("mail_logs").add({
      ...entry,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error("mail_logs write failed", e);
  }
}

async function sendEmailCore({template, to, data, apiKey, sentBy}) {
  if (!isValidEmail(to)) {
    const err = new Error("Invalid recipient email");
    err.code = "invalid-argument";
    throw err;
  }
  if (typeof template !== "string" || template.length === 0) {
    const err = new Error("Missing template name");
    err.code = "invalid-argument";
    throw err;
  }

  const tpl = getTemplate(template);
  const subject = tpl.subject(data);
  const html = tpl.html(data);
  const client = getResendClient(apiKey);

  let result;
  try {
    result = await client.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
  } catch (thrown) {
    const message = thrown && thrown.message ? thrown.message : String(thrown);
    await logMail({to, template, status: "failed", providerId: null,
      error: message, sentBy: sentBy || null});
    const err = new Error("Failed to send email");
    err.code = "internal";
    err.cause = message;
    throw err;
  }

  // Resend SDK does not throw on API-level errors; it returns {data, error}.
  if (result && result.error) {
    const apiError = result.error;
    const message = `${apiError.name || "resend_error"}: ${apiError.message}`;
    await logMail({to, template, status: "failed", providerId: null,
      error: message, sentBy: sentBy || null});
    const err = new Error("Failed to send email");
    err.code = "internal";
    err.cause = message;
    throw err;
  }

  const providerId = result && result.data && result.data.id ?
    result.data.id : null;

  await logMail({
    to,
    template,
    status: "sent",
    providerId,
    error: null,
    sentBy: sentBy || null,
  });

  return {id: providerId, status: "sent"};
}

module.exports = {sendEmailCore};
