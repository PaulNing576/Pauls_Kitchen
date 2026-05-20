import { useState } from "react"

function Checkout({
  cart,
  placeOrder,
  setCurrentPage,
  verifyCode
}) {

  const [step, setStep] = useState(1)

  const [accessCode, setAccessCode] =
    useState("")
  const [codeVerified, setCodeVerified] =
    useState(false)
  const [verifiedCodeData, setVerifiedCodeData] =
    useState(null)

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  )

  function nextStep() {
    setStep(step + 1)
  }

  async function handleVerifyCode() {

    const codeData =
        await verifyCode(accessCode)

    if (!codeData) {
        alert("Invalid or used code")
        return
    }

    setVerifiedCodeData(codeData)
    setCodeVerified(true)
    setStep(3)
  }

  function prevStep() {
    setStep(step - 1)
  }

  return (
    <div className="checkout-page">
      {/* STEP BAR */}
      <div className="checkout-steps">
        
        <div
          className={
            step >= 1
              ? "step active-step"
              : "step"
          }
        >
          <span>1</span>
          <p>Order</p>
        </div>

        <div
          className={
            step >= 2
              ? "step active-step"
              : "step"
          }
        >
          <span>2</span>
          <p>Access</p>
        </div>

        <div
          className={
            step >= 3
              ? "step active-step"
              : "step"
          }
        >
          <span>3</span>
          <p>Schedule</p>
        </div>

        <div
          className={
            step >= 4
              ? "step active-step"
              : "step"
          }
        >
          <span>4</span>
          <p>Payment</p>
        </div>

      </div>

      {/* STEP CONTENT */}

      <div className="checkout-content">

        {

          step === 1 && (

            <div>

              <h2>
                Confirm Your Order
              </h2>

              {

                cart.map((item) => (

                  <p key={item.name}>

                    {item.name}
                    x{item.quantity}

                  </p>
                ))
              }

              <h3>
                Total: ${total}
              </h3>

              <button
                onClick={() =>
                  setCurrentPage("menu")
                }
              >
                Back to Menu
              </button>

              <button onClick={nextStep}>
                Continue
              </button>

            </div>
          )
        }

        {
          step === 2 && (
            <div>
              <h2>
                Enter Access Code
              </h2>
              <input
                value={accessCode}
                onChange={(e) =>
                  setAccessCode(e.target.value)
                }
                placeholder="Access Code"
              />

              {
                codeVerified && (
                  <p>
                    Code Accepted !
                  </p>
                )
              }

              <button onClick={prevStep}>
                Back
              </button>
              <button onClick={handleVerifyCode}>
                Verify
              </button>

            </div>
          )
        }

        {

          step === 3 && (

            <div>

              <h2>
                Select Reservation Time
              </h2>

              <input type="datetime-local" />

              <button onClick={prevStep}>
                Back
              </button>

              <button onClick={nextStep}>
                Continue
              </button>

            </div>
          )
        }

        {

          step === 4 && (
            <div>
              {
                verifiedCodeData?.type ===
                  "permanent"
                ||
                verifiedCodeData?.type ===
                  "guest"
                ? (
                  <>
                    <h2>
                      Payment Skipped
                    </h2>
                    <p>
                      Your access code includes
                      complimentary dining. <br />
                      Balance for this meal is waived!
                    </p>
                  </>
                ) : (
                  <>
                    <h2>
                      Payment
                    </h2>
                    <p>
                      Online payment coming soon
                    </p>
                  </>
                )
              }

              <button onClick={prevStep}>
                Back
              </button>
              <button
                onClick={() =>
                  placeOrder(verifiedCodeData)
                }
              >
                Place Order
              </button>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default Checkout