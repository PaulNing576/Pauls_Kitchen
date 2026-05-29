const {layout} = require("./_layout");

function subject() {
  return "Order Confirmation — Paul's Kitchen";
}

function html(data) {
  const itemsRows = data.items.map((item) => `
    <tr>
      <td style="padding: 6px 12px; font-size: 14px;">${item.name} x${item.quantity}</td>
      <td style="padding: 6px 12px; text-align: right; font-size: 14px;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join("");

  const cardLine = data.cardInfo
    ? `<p style="font-size: 14px; margin: 4px 0;">Payment: ${data.cardInfo}</p>`
    : `<p style="font-size: 14px; margin: 4px 0;">Payment: Complimentary</p>`;

  const body = `
    <p style="font-size: 15px; line-height: 1.5;">Hi ${data.customerName},</p>
    <p style="font-size: 15px; line-height: 1.5;">
      Thank you for your order. Here's a summary:
    </p>

    <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
      ${itemsRows}
      <tr style="border-top: 1px solid #ddd;">
        <td style="padding: 10px 12px; font-weight: 600; font-size: 14px;">Total</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600; font-size: 14px;">$${data.total.toFixed(2)}</td>
      </tr>
    </table>

    <p style="font-size: 14px; margin: 8px 0;">
      Date: ${data.reservationTime.date}<br>
      Time: ${data.reservationTime.time}
    </p>
    ${cardLine}

    <p style="font-size: 13px; color: #555; margin-top: 20px;">
      We look forward to serving you. If you have any questions, please reply to this email.
    </p>
  `;

  return layout({title: subject(), bodyHtml: body});
}

module.exports = {subject, html};
