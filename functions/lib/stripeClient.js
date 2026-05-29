const Stripe = require("stripe");

let cached = null;

function getStripeClient(apiKey) {
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!cached || cached.key !== apiKey) {
    cached = {key: apiKey, client: new Stripe(apiKey)};
  }
  return cached.client;
}

module.exports = {getStripeClient};
