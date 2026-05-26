import { useEffect, useState } from "react"

import app from "../firebase"

import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  addDoc,
  updateDoc
} from "firebase/firestore"

import generateCode from "../utils/generateCode"
import AdminLogin from "./AdminLogin"

function Admin() {

  const [authenticated, setAuthenticated] = useState(false)
  const [orders, setOrders] = useState([])
  const [waitlist, setWaitlist] = useState([])
  const db = getFirestore(app)

  useEffect(() => {

    const waitlistQuery = query(
      collection(db, "waitlist"),
      orderBy("createdAt", "desc")
    )

    const unsubscribeWaitlist =
      onSnapshot(
        waitlistQuery,
        (snapshot) => {
          const waitlistData =
            snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
          setWaitlist(waitlistData)
        }
      )


    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(
      q,

      (snapshot) => {

        const ordersData = snapshot.docs.map((doc) => {

          return {
            id: doc.id,
            ...doc.data()
          }
        })

        setOrders(ordersData)
      }
    )

    return () => {
      unsubscribe()
      unsubscribeWaitlist()
    }

  }, [])

  async function completeOrder(orderId) {

    await deleteDoc(
      doc(db, "orders", orderId)
    )
  }

  async function generateSingleCode() {

    const newCode = generateCode()

    await addDoc(
        collection(db, "codes"),
        {
        code: newCode,
        type: "single",
        used: false
        }
    )
    alert(`New code: ${newCode}`)
  }

  async function generateGuestCode() {
    const newCode = generateCode()
    await addDoc(
      collection(db, "codes"),
      {
        code: newCode,
        type: "guest",
        used: false
      }
    )
    alert(`Guest code: ${newCode}`)
  }

  async function approveRequest(user) {

    const code = generateCode()

    try {
      await addDoc(
        collection(db, "codes"),
        {
          code,
          type: "single",
          used: false,
          createdAt: new Date()
        }
      )
      await updateDoc(
        doc(db, "waitlist", user.id),
        {
          status: "approved",
          approvedCode: code
        }
      )

      const response =
        await fetch(
          "https://us-central1-pauls-kitchen-bf4e6.cloudfunctions.net/sendApprovalEmailHttp",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              email: user.email,
              code: code
            })
          }
        )

      alert(
        `${user.firstName}'s code: ${code}`
      )

      const result =
        await response.json()
      console.log(result)

    } catch (error) {
      console.error(error)
    }
  }

  if (!authenticated) {
    return (
      <AdminLogin
        onSuccess={() =>
          setAuthenticated(true)
        }
      />
    )
  }

  async function declineRequest(user) {
    try {
      await updateDoc(
        doc(db, "waitlist", user.id),
        {
          status: "declined"
        }
      )
    } catch (error) {
      console.error(error)
    }
  }

  return (

    <div className="admin-page">
      <button
        className="generate-code-button"
        onClick={generateSingleCode}
      >
        Generate Invite Code
      </button>
      <button
        className="generate-guest-button"
        onClick={generateGuestCode}
      >
        Generate Guest Code
      </button>
      <h1>Orders Dashboard</h1>
      {orders.map((order) => (
        <div
          className="order-card"
          key={order.id}
        >
          <h3>
            Order
            <span className="order-time">
                {new Date(
                order.createdAt.seconds * 1000
                ).toLocaleString()}
            </span>
          </h3>
          {order.items.map((item) => (
            <p>
              {item.name} x{item.quantity}
            </p>
          ))}
          <button
            className="complete-button"
            onClick={() => completeOrder(order.id)}
          >
            Complete
          </button>
        </div>
      ))}

      <h2>Waitlist Requests</h2>
      {
        waitlist.map((user) => (

          <div
            key={user.id}
          >
          <div
            key={user.id}
            className="waitlist-card"
          >
            <p>
              <strong>Name:{" "}</strong>
              {user.firstName}
            </p>
            <p>
              <strong>Email:{" "}</strong>
              {user.email}
            </p>
            <p>
              <strong>Status:{" "}</strong>
              {user.status}
            </p>
            {
              user.status === "declined" && (
                <p style={{ color: "gray" }}>
                  Request declined
                </p>
              )
            }
            {
              user.status === "pending" && (
                <div className="waitlist-actions">
                  <button
                    className="approve-button"
                    onClick={() =>
                      approveRequest(user)
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="decline-button"
                    onClick={() =>
                      declineRequest(user)
                    }
                  >
                    Decline
                  </button>
                </div>
              )
            }
            {
              user.approvedCode && (
                <p>
                  Code: {" "}
                  {user.approvedCode}
                </p>
              )
            }
          </div>
          </div>
        ))
      }
    </div>
  )
}

export default Admin