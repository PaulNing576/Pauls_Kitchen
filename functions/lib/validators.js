const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value) {
  return typeof value === "string" && EMAIL_RE.test(value);
}

function assertCallerIsAdmin(auth) {
  if (!auth) {
    const err = new Error("Authentication required");
    err.code = "unauthenticated";
    throw err;
  }
  if (!auth.token || auth.token.admin !== true) {
    const err = new Error("Caller is not an admin");
    err.code = "permission-denied";
    throw err;
  }
}

module.exports = {isValidEmail, assertCallerIsAdmin};
