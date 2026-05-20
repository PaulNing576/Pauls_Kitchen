import { Link } from "react-router-dom"

import bgImage from "../images/landingBG.png"

import { useState } from "react"

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore"

import app from "../firebase"

function Landing() {
  
  const db = getFirestore(app)
  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  
  async function handleRequestAccess() {

    if (!firstName || !email) {
      alert("Please fill out all fields")
      return
    }

    try {
      await addDoc(
        collection(db, "waitlist"),
        {
          firstName,
          email,
          status: "pending",
          createdAt: serverTimestamp()
        }
      )

      alert("Request submitted!")
      setFirstName("")
      setEmail("")

    } catch (error) {
      console.error(error)
      alert("Something went wrong")
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
        <div className="landing-subtitle">
          <div className="landing-access-box">
            <p className="landing-access-text">
              Please prepare your access code from Paul.
              <br />
              If you don't have it yet,
              request one from below.
            </p>
            <input
              type="text"
              placeholder="First Name"
              className="landing-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="landing-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="request-button"
              onClick={handleRequestAccess}
            >
              Request Access
            </button>
          </div>
          Homemade food made with love
        </div>

        <Link
          to="/menu"
          className="enter-button"
        >
          Enter Menu
        </Link>

      </div>
    </div>
  )
}

export default Landing