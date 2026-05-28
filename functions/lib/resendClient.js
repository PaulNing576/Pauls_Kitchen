const {Resend} = require("resend");

let cached = null;

function getResendClient(apiKey) {
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  if (!cached || cached.key !== apiKey) {
    cached = {key: apiKey, client: new Resend(apiKey)};
  }
  return cached.client;
}

module.exports = {getResendClient};
