require("dotenv").config()

const functions =
  require("firebase-functions");

const { Resend } =
  require("resend");

const cors =
  require("cors")({
    origin: true
  });

const resend =
  new Resend(process.env.RESEND_API_KEY);

exports.sendApprovalEmailHttp =
  functions.https.onRequest(

    (req, res) => {

      cors(
        req,
        res,

        async () => {
          try {
            const {
              email,
              code
            } = req.body;

            await resend.emails.send({

              from:
                "Paul's Kitchen <onboarding@resend.dev>",

              to: email,

              subject:
                "Your Access Code",

              html: `

                <h1>
                  Welcome to Paul's Kitchen
                </h1>

                <p>
                  Your access code:
                </p>

                <h2>${code}</h2>

              `
            });

            res.status(200).send({

              success: true

            });

          } catch (error) {

            console.error(error);
            res.status(500).send({
              error:
                "Failed to send email"
            });
          }
        }
      );
    }
  );