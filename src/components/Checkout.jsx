import { useState } from "react"

/* ui imports */
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"
import Modal from "../components/ui/Modal"

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

  const [modalData, setModalData] =
    useState({
      open: false,
      title: "",
      message: ""
    })

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
        setModalData({
          open: true,
          title: "Invalid Code",
          message:
            "Invalid or used code. Please check the code you typed"
        })
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

      <Card className="checkout-content">

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
                <Button
                  type="secondary"
                  onClick={() =>
                    setCurrentPage("menu")
                  }
                >
                  Back to Menu
                </Button>

                <Button 
                  type="primary"
                  onClick={nextStep}>
                  Continue
                </Button>
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
              <Input
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
                <Button
                  type="secondary" 
                  onClick={prevStep}>
                  Back
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleVerifyCode}>
                  Verify
                </Button>
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
              <Input
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
                <Button 
                  type="secondary" 
                  onClick={prevStep}>
                  Back
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => {
                    if (!selectedDate) {
                      setModalData({
                        open: true,
                        title: "Missing Information",
                        message:
                          "Please select a date."
                      })
                      return
                    }

                    if (!selectedTime) {
                      setModalData({
                        open: true,
                        title: "Missing Information",
                        message:
                          "Please select a time."
                      })
                      return
                    }
                    nextStep()
                  }}
                >
                  Continue
                </Button>
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
                <Button 
                  type="secondary" 
                  onClick={prevStep}>
                  Back
                </Button>
                <Button 
                  type="primary" 
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
                </Button>
              </div>
            </div>
          )
        }
      </Card>

      <Modal
        isOpen={modalData.open}
        title={modalData.title}
        onClose={() =>
          setModalData({
            open: false,
            title: "",
            message: ""
          })
        }
      >
        {modalData.message}
      </Modal>
    </div>
  )
}

export default Checkout
