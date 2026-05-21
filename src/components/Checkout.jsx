import { useState } from "react"

function Checkout({
  cart,
  placeOrder,
  setCurrentPage,
  verifyCode
}) {

  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] =
    useState("")
  const [selectedTime, setSelectedTime] =
    useState("")

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

  function generateTimeSlots() {
    const slots = []
    for (
      let hour = 17;
      hour <= 21;
      hour++
    ) {
      for (
        let minute = 0;
        minute < 60;
        minute += 15
      ) {
        const h =
          hour > 12
            ? hour - 12
            : hour

        const m =
          minute
            .toString()
            .padStart(2, "0")

        const suffix =
          hour >= 12 ? "PM" : "AM"

        slots.push(
          `${h}:${m} ${suffix}`
        )
      }
    }
    return slots
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
        <div className="checkout-progress-row">
          <div className="step-circle active-step">
            1
          </div>
          <div className="step-line"></div>

          <div
            className={
              step >= 2
                ? "step-circle active-step"
                : "step-circle"
            }
          >
            2
          </div>
          <div className="step-line"></div>

          <div
            className={
              step >= 3
                ? "step-circle active-step"
                : "step-circle"
            }
          >
            3
          </div>
          <div className="step-line"></div>

          <div
            className={
              step >= 4
                ? "step-circle active-step"
                : "step-circle"
            }
          >
            4
          </div>
        </div>

        <div className="checkout-label-row">
          <p>Order</p>
          <p>Access</p>
          <p>Schedule</p>
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

              <div className="checkout-buttons">
                <button
                  className="checkout-secondary-button"
                  onClick={() =>
                    setCurrentPage("menu")
                  }
                >
                  Back to Menu
                </button>

                <button 
                  className="checkout-primary-button"
                  onClick={nextStep}>
                  Continue
                </button>
              </div>
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
              <div className="checkout-buttons">
                <button
                  className="checkout-secondary-button" 
                  onClick={prevStep}>
                  Back
                </button>
                <button 
                  className="checkout-primary-button"
                  onClick={handleVerifyCode}>
                  Verify
                </button>
              </div>
            </div>
          )
        }

        {

          step === 3 && (
            <div className="checkout-step">
              <h2>
                Select Reservation Time
              </h2>
              <input
                type="date"
                value={selectedDate}
                min={
                  new Date(
                    Date.now()
                    + 3 * 24 * 60 * 60 * 1000
                  )
                  .toISOString()
                  .split("T")[0]
                }
                onChange={(e) =>
                  setSelectedDate(e.target.value)
                }
                onKeyDown={(e) =>
                  e.preventDefault()
                }
              />

              {
                selectedTime && (
                  <p className="selected-time-text">
                    Selected Time: {" "}
                    {selectedTime}
                  </p>
                )
              }

              <div className="time-slots">
                {
                  generateTimeSlots().map((slot) => (
                    <button
                      key={slot}
                      className={
                        selectedTime === slot
                          ? "time-slot selected-slot"
                          : "time-slot"
                      }
                      onClick={() =>
                        setSelectedTime(slot)
                      }
                    >
                      {slot}
                    </button>
                  ))
                }
              </div>

              <div className="checkout-buttons">
                <button 
                  className="checkout-secondary-button"
                  onClick={prevStep}>
                  Back
                </button>
                <button
                  className="checkout-primary-button"
                  onClick={() => {
                    if (!selectedDate) {
                      alert(
                        "Please select a date"
                      )
                      return
                    }

                    if (!selectedTime) {
                      alert(
                        "Please select a time"
                      )
                      return
                    }

                    nextStep()
                  }}
                >
                  Continue
                </button>
              </div>
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
              <div className="checkout-buttons">
                <button 
                  className="checkout-secondary-button"
                  onClick={prevStep}>
                  Back
                </button>
                <button
                  className="checkout-primary-button"
                  onClick={() =>
                    placeOrder(
                      verifiedCodeData,
                      {
                        date: selectedDate,
                        time: selectedTime
                      }
                    )
                  }
                >
                  Place Order
                </button>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default Checkout
