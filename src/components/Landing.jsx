import { Link } from "react-router-dom"

import bgImage from "../images/landingBG.png"

import { useState } from "react"

import { httpsCallable } from "firebase/functions"

import { functions } from "../firebase"

/* ui imports */
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"
import Modal from "../components/ui/Modal"

function Landing() {

  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [modalData, setModalData] =
    useState({
      open: false,
      title: "",
      message: ""
    })
  
  async function handleRequestAccess() {

    if (!firstName || !email) {
      setModalData({
        open: true,
        title: "Missing Information",
        message:
          "Please fill out all fields."
      })
      return
    }

    try {
      const submitWaitlist = httpsCallable(functions, "submitWaitlist");
      await submitWaitlist({ firstName, email });

      setModalData({
        open: true,
        title: "Request Submitted",
        message:
          "Paul will review your request shortly."
      })
      setFirstName("")
      setEmail("")

    } catch (error) {
      console.error(error)
      const message = error.code === "functions/resource-exhausted"
        ? "System busy, please try again later"
        : "Something went wrong, please try again";
      setModalData({
        open: true,
        title: "Error",
        message,
      })
    }
  }

  return (
    <div
      className="landing-page"
      style={{
        backgroundImage: `url(${bgImage})`
      }}
    >
      <div className="landing-overlay">
        <h1 className="landing-title">
           Paul 's Kitchen 
        </h1>

        <Link
          to="/menu"
          className="enter-button"
        >
          Enter Menu
        </Link>

        <div className="landing-subtitle">
          Homemade food made with love
        </div>

        <Card className="landing-access-box">
          <p className="landing-access-text">
            Please prepare your access code from Paul.
            <br />
            If you don't have it yet,
            request one from below.
          </p>
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="tertiary"
            onClick={handleRequestAccess}
          >
            Request Access
          </Button>
        </Card>
      </div>

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

export default Landing