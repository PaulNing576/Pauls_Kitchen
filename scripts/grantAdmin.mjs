// One-shot script to grant a user the { admin: true } custom claim.
//
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS="./path-to-service-account.json" \
//   node scripts/grantAdmin.mjs <email>
//
// Service account JSON: download from Firebase Console
//   Project Settings -> Service Accounts -> Generate new private key
// Keep that JSON file out of git. It is matched by .gitignore.

import {initializeApp, applicationDefault} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/grantAdmin.mjs <email>");
  process.exit(1);
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
      "GOOGLE_APPLICATION_CREDENTIALS env var is required " +
      "and must point to a service account JSON.",
  );
  process.exit(1);
}

initializeApp({credential: applicationDefault()});
const auth = getAuth();

try {
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, {admin: true});
  const updated = await auth.getUser(user.uid);
  console.log("Granted admin claim:");
  console.log("  uid:    ", updated.uid);
  console.log("  email:  ", updated.email);
  console.log("  claims: ", updated.customClaims);
  console.log("\nThe user must sign out and sign back in (or the app must " +
              "force-refresh the ID token) for the new claim to take effect.");
} catch (err) {
  console.error("Failed:", err.message || err);
  process.exit(1);
}
