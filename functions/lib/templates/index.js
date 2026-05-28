const accessCode = require("./accessCode");
const waitlistApproved = require("./waitlistApproved");
const waitlistRejected = require("./waitlistRejected");

const templates = {
  accessCode,
  waitlistApproved,
  waitlistRejected,
};

function getTemplate(name) {
  const t = templates[name];
  if (!t) {
    throw new Error(`Unknown email template: ${name}`);
  }
  return t;
}

module.exports = {getTemplate, templates};
