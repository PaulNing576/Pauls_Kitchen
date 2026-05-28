const {onCall, onRequest, HttpsError} =
  require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const {setGlobalOptions} = require("firebase-functions/v2");
const cors = require("cors")({origin: true});

const {sendEmailCore} = require("./lib/sendEmail");
const {assertCallerIsAdmin} = require("./lib/validators");

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

setGlobalOptions({region: "us-central1", maxInstances: 10});

function resolveApiKey() {
  // In deployed environment, defineSecret().value() returns the secret.
  // In local emulator without secret binding, fall back to process.env
  // (loaded via dotenv from functions/.env).
  try {
    const v = RESEND_API_KEY.value();
    if (v) return v;
  } catch (e) {
    // value() throws if accessed outside a function with the secret bound.
  }
  return process.env.RESEND_API_KEY;
}

exports.sendEmail = onCall(
    {secrets: [RESEND_API_KEY]},
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

// Deprecated: kept for one release cycle so the live Admin page does not break
// during the frontend cutover. Remove in P4.
exports.sendApprovalEmailHttp = onRequest(
    {secrets: [RESEND_API_KEY]},
    (req, res) => {
      cors(req, res, async () => {
        console.warn(
            "[deprecated] sendApprovalEmailHttp called; " +
            "migrate caller to sendEmail callable",
        );
        try {
          const {email, code} = req.body || {};
          const result = await sendEmailCore({
            template: "accessCode",
            to: email,
            data: {code},
            apiKey: resolveApiKey(),
            sentBy: "legacy-http-shim",
          });
          res.status(200).send({success: true, id: result.id});
        } catch (error) {
          console.error("sendApprovalEmailHttp failed:", error);
          res.status(500).send({
            error: "Failed to send email",
            cause: error.cause || error.message || null,
          });
        }
      });
    },
);
