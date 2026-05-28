const {layout} = require("./_layout");

function validate(data) {
  if (!data || typeof data.firstName !== "string" || data.firstName.length === 0) {
    throw new Error("waitlistApproved template requires a non-empty 'firstName'");
  }
}

function subject(data) {
  return `You're on the list, ${data.firstName}!`;
}

function html(data) {
  validate(data);
  const body = `
    <p style="font-size: 15px; line-height: 1.5;">
      Hi ${data.firstName}, your waitlist request has been approved. We'll be in touch soon with
      your access code and next steps to complete your reservation.
    </p>
    <p style="font-size: 13px; color: #555;">
      If you have any questions, just reply to this email.
    </p>
  `;
  return layout({title: subject(data), bodyHtml: body});
}

module.exports = {subject, html};
