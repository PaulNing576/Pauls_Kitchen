import { useState } from "react"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { httpsCallable } from "firebase/functions"

import { stripePromise } from "../lib/stripe"
import { functions } from "../firebase"

/* ui imports */
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"
import Modal from "../components/ui/Modal"

function PaymentForm({ total, verifiedCodeData, reservationTime, placeOrder, prevStep, customerName, customerEmail, confirmEmail }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handlePay() {
    if (!customerName.trim()) {
      setError("Please enter your name")
      return
    }
    if (!customerEmail.trim()) {
      setError("Please enter your email")
      return
    }
    if (customerEmail.trim() !== confirmEmail.trim()) {
      setError("Emails do not match")
      return
    }

    setLoading(true)
    setError("")

    try {
      const createPI = httpsCallable(functions, "createPaymentIntent")
      const result = await createPI({ amount: total })
      const { clientSecret, paymentIntentId } = result.data

      const confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      })

      if (confirmResult.error) {
        setError(confirmResult.error.message)
        return
      }

      if (confirmResult.paymentIntent.status === "succeeded") {
        await placeOrder(verifiedCodeData, reservationTime, paymentIntentId, {
          name: customerName.trim(),
          email: customerEmail.trim(),
        })
      }
    } catch (e) {
      setError(e.message || "Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2>Payment</h2>
      <h3>Total: ${total}</h3>
      <div className="stripe-card-wrapper">
        <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
      </div>
      {error && <p className="payment-error">{error}</p>}
      <div className="checkout-buttons">
        <Button type="secondary" onClick={prevStep}>
          Back
        </Button>
        <Button type="primary" onClick={handlePay} disabled={!stripe || loading}>
          {loading ? "Processing…" : `Pay $${total}`}
        </Button>
      </div>
    </>
  )
}

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

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")

  function validateCustomerInfo() {
    if (!customerName.trim()) return "Please enter your name"
    if (!customerEmail.trim()) return "Please enter your email"
    if (!confirmEmail.trim()) return "Please confirm your email"
    if (customerEmail.trim() !== confirmEmail.trim()) return "Emails do not match"
    return null
  }

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
              <h2>Your Information</h2>
              <div className="customer-info-fields">
                <Input
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Confirm Email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                />
              </div>
              {
                verifiedCodeData?.type === "permanent"
                ||
                verifiedCodeData?.type === "guest"
                ? (
                  <>
                    <h2>Payment Skipped</h2>
                    <p>
                      Your access code includes
                      complimentary dining. <br />
                      Balance for this meal is waived!
                    </p>
                    <div className="checkout-buttons">
                      <Button type="secondary" onClick={prevStep}>Back</Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          const err = validateCustomerInfo()
                          if (err) {
                            setModalData({ open: true, title: "Missing Information", message: err })
                            return
                          }
                          placeOrder(
                            verifiedCodeData,
                            { date: selectedDate, time: selectedTime },
                            null,
                            { name: customerName.trim(), email: customerEmail.trim() },
                          )
                        }}
                      >
                        Place Order
                      </Button>
                    </div>
                  </>
                ) : (
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      total={total}
                      verifiedCodeData={verifiedCodeData}
                      reservationTime={{ date: selectedDate, time: selectedTime }}
                      placeOrder={placeOrder}
                      prevStep={prevStep}
                      customerName={customerName}
                      customerEmail={customerEmail}
                      confirmEmail={confirmEmail}
                    />
                  </Elements>
                )
              }
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
