const {layout} = require("./_layout");

function validate(data) {
  if (!data || typeof data.firstName !== "string" || data.firstName.length === 0) {
    throw new Error("waitlistRejected template requires a non-empty 'firstName'");
  }
}

function subject(data) {
  return `An update on your request, ${data.firstName}`;
}

function html(data) {
  validate(data);
  const body = `
    <p style="font-size: 15px; line-height: 1.5;">
      Hi ${data.firstName}, thank you for your interest in Paul's Kitchen. Unfortunately we're
      unable to accommodate your request at this time. We hope to welcome you in the future.
    </p>
    <p style="font-size: 13px; color: #555;">
      If you believe this was a mistake, please reach out to us directly.
    </p>
  `;
  return layout({title: subject(data), bodyHtml: body});
}

module.exports = {subject, html};
