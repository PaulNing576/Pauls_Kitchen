const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");
const {getStripeClient} = require("./stripeClient");

function getDb() {
  try {
    return admin.firestore();
  } catch {
    admin.initializeApp();
    return admin.firestore();
  }
}

async function createPaymentIntentCore({amount, apiKey}) {
  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    const err = new Error("Invalid payment amount");
    err.code = "invalid-argument";
    throw err;
  }

  const stripe = getStripeClient(apiKey);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amountNum * 100),
    currency: "usd",
    automatic_payment_methods: {enabled: true},
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

async function confirmOrderCore({items, reservationTime, codeData, paymentIntentId, apiKey, customerName, customerEmail}) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const err = new Error("Order must contain at least one item");
    err.code = "invalid-argument";
    throw err;
  }
  if (!reservationTime || !reservationTime.date || !reservationTime.time) {
    const err = new Error("Reservation time is required");
    err.code = "invalid-argument";
    throw err;
  }
  if (!codeData || !codeData.type) {
    const err = new Error("Invalid access code");
    err.code = "invalid-argument";
    throw err;
  }

  let paymentStatus = "waived";
  let stripePaymentIntentId = null;
  let cardLast4 = null;
  let cardBrand = null;

  if (codeData.type === "single") {
    if (!paymentIntentId) {
      const err = new Error("Payment is required for this access code type");
      err.code = "invalid-argument";
      throw err;
    }

    const stripe = getStripeClient(apiKey);
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      {expand: ["payment_method"]},
    );

    if (paymentIntent.status !== "succeeded") {
      const err = new Error("Payment has not been completed");
      err.code = "failed-precondition";
      throw err;
    }

    paymentStatus = "paid";
    stripePaymentIntentId = paymentIntentId;

    const card = paymentIntent.payment_method?.card;
    if (card) {
      cardLast4 = card.last4;
      cardBrand = card.brand;
    }
  }

  const db = getDb();
  const orderRef = await db.collection("orders").add({
    items,
    reservationTime,
    customerName: customerName || null,
    customerEmail: customerEmail || null,
    createdAt: FieldValue.serverTimestamp(),
    paymentStatus,
    stripePaymentIntentId: stripePaymentIntentId || null,
  });

  if (codeData.type === "single" || codeData.type === "guest") {
    await db.collection("codes").doc(codeData.id).update({used: true});
  }

  return {orderId: orderRef.id, paymentStatus, cardLast4, cardBrand};
}

module.exports = {createPaymentIntentCore, confirmOrderCore};
