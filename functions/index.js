const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const {setGlobalOptions} = require("firebase-functions/v2");

const {sendEmailCore} = require("./lib/sendEmail");
const {submitWaitlistCore} = require("./lib/submitWaitlist");
const {createPaymentIntentCore, confirmOrderCore} = require("./lib/payment");
const {assertCallerIsAdmin} = require("./lib/validators");

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");

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

function resolveStripeKey() {
  try {
    const v = STRIPE_SECRET_KEY.value();
    if (v) return v;
  } catch (e) {
    // value() throws if accessed outside a function with the secret bound.
  }
  return process.env.STRIPE_SECRET_KEY_DEV;
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

exports.createPaymentIntent = onCall(
    {secrets: [STRIPE_SECRET_KEY], cors: true},
    async (request) => {
      const {amount} = request.data || {};
      try {
        return await createPaymentIntentCore({
          amount,
          apiKey: resolveStripeKey(),
        });
      } catch (e) {
        const known = ["invalid-argument"];
        const code = known.includes(e.code) ? e.code : "internal";
        throw new HttpsError(code, e.message);
      }
    },
);

exports.confirmOrder = onCall(
    {secrets: [STRIPE_SECRET_KEY, RESEND_API_KEY], cors: true},
    async (request) => {
      const {items, reservationTime, codeData, paymentIntentId, customerName, customerEmail} = request.data || {};
      try {
        const result = await confirmOrderCore({
          items,
          reservationTime,
          codeData,
          paymentIntentId,
          apiKey: resolveStripeKey(),
          customerName,
          customerEmail,
        });

        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const cardInfo = result.cardBrand
          ? `${result.cardBrand.charAt(0).toUpperCase() + result.cardBrand.slice(1)} ending in ${result.cardLast4}`
          : null;

        sendEmailCore({
          template: "orderConfirmation",
          to: customerEmail,
          data: {
            customerName: customerName || "Guest",
            items,
            reservationTime,
            total,
            cardInfo,
          },
          apiKey: resolveApiKey(),
          sentBy: "system",
        }).catch((e) => console.error("Confirmation email failed:", e));

        return {orderId: result.orderId, paymentStatus: result.paymentStatus};
      } catch (e) {
        const known = ["invalid-argument", "failed-precondition"];
        const code = known.includes(e.code) ? e.code : "internal";
        throw new HttpsError(code, e.message);
      }
    },
);