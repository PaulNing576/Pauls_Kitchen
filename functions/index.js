const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const {setGlobalOptions} = require("firebase-functions/v2");

const {sendEmailCore} = require("./lib/sendEmail");
const {submitWaitlistCore} = require("./lib/submitWaitlist");
const {assertCallerIsAdmin} = require("./lib/validators");

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

setGlobalOptions({region: "us-central1", maxInstances: 10});

function resolveApiKey() {
  try {
    const v = RESEND_API_KEY.value();
    if (v) return v;
  } catch (e) {
    // value() throws if accessed outside a function with the secret bound.
  }
  return process.env.RESEND_API_KEY_DEV;
}

exports.sendEmail = onCall(
    {secrets: [RESEND_API_KEY], cors: true},
    async (request) => {
      try {
        assertCallerIsAdmin(request.auth);
      } catch (e) {
        throw new HttpsError(
            e.code === "unauthenticated" ? "unauthenticated" : "permission-denied",
            e.message,
        );
      }

      const {template, to, data} = request.data || {};
      try {
        return await sendEmailCore({
          template,
          to,
          data,
          apiKey: resolveApiKey(),
          sentBy: request.auth.uid,
        });
      } catch (e) {
        const code = e.code || "internal";
        throw new HttpsError(code, e.message, {cause: e.cause});
      }
    },
);

exports.submitWaitlist = onCall(
    {cors: true},
    async (request) => {
      const {firstName, email} = request.data || {};
      try {
        return await submitWaitlistCore({firstName, email});
      } catch (e) {
        const known = ["invalid-argument", "resource-exhausted"];
        const code = known.includes(e.code) ? e.code : "internal";
        throw new HttpsError(code, e.message);
      }
    },
);