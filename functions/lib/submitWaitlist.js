const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");
const {isValidEmail} = require("./validators");

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getDb() {
  try {
    return admin.firestore();
  } catch {
    admin.initializeApp();
    return admin.firestore();
  }
}

async function submitWaitlistCore({firstName, email}) {
  const trimmedName = typeof firstName === "string" ? firstName.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";

  if (!trimmedName) {
    const err = new Error("Name is required");
    err.code = "invalid-argument";
    throw err;
  }
  if (!isValidEmail(trimmedEmail)) {
    const err = new Error("Invalid email address");
    err.code = "invalid-argument";
    throw err;
  }

  const db = getDb();
  const snapshot = await db
      .collection("waitlist")
      .where("email", "==", trimmedEmail)
      .get();

  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  let recentCount = 0;
  snapshot.forEach((doc) => {
    const ts = doc.data().createdAt;
    if (ts && ts.toDate().getTime() > cutoff) {
      recentCount++;
    }
  });

  if (recentCount >= RATE_LIMIT_MAX) {
    const err = new Error("System busy, please try again later");
    err.code = "resource-exhausted";
    throw err;
  }

  await db.collection("waitlist").add({
    firstName: trimmedName,
    email: trimmedEmail,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
  });

  return {success: true};
}

module.exports = {submitWaitlistCore};
