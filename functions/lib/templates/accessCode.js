const {layout} = require("./_layout");

function validate(data) {
  if (!data || typeof data.code !== "string" || data.code.length === 0) {
    throw new Error("accessCode template requires a non-empty 'code'");
  }
}

function subject() {
  return "Your Paul's Kitchen access code";
}

function html(data) {
  validate(data);
  const body = `
    <p style="font-size: 15px; line-height: 1.5;">
      You've been approved. Use the code below to complete your reservation.
    </p>
    <div style="margin: 24px 0; padding: 20px; background: #f4efe6;
                border-radius: 12px; text-align: center;
                font-size: 28px; letter-spacing: 4px; font-weight: 600;">
      ${data.code}
    </div>
    <p style="font-size: 13px; color: #555;">
      This code is single-use. If you didn't request it, you can ignore this email.
    </p>
  `;
  return layout({title: subject(), bodyHtml: body});
}

module.exports = {subject, html};
