import { useEffect, useState } from "react"

import { db, functions } from "../firebase"

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  addDoc,
  updateDoc
} from "firebase/firestore"

import { httpsCallable } from "firebase/functions"

import generateCode from "../utils/generateCode"
import AdminLogin from "./AdminLogin"
import { useAuth } from "../contexts/AuthContext"
import useBrowserNotification from "../hooks/useBrowserNotification"
import useNewItemDetector from "../hooks/useNewItemDetector"
import { ToastContainer } from "./ui/Toast"

function Admin() {

  const { user, isAdmin, loading, signOut } = useAuth()
  const [orders, setOrders] = useState([])
  const [waitlist, setWaitlist] = useState([])
  const [toasts, setToasts] = useState([])
  const { notify } = useBrowserNotification()
  useEffect(() => {

    if (!isAdmin) return

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

  }, [isAdmin, db])

  function addToast(toast) {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  useNewItemDetector(waitlist, "id", (item) => {
    const title = "New Waitlist Request"
    const body = `${item.firstName} (${item.email}) is requesting access`
    addToast({ title, body, type: "waitlist" })
    notify(title, { body })
  })

  useNewItemDetector(orders, "id", (order) => {
    const itemCount = order.items?.length || 0
    const preview = order.items?.slice(0, 3).map((i) => i.name).join(", ")
    const suffix = order.items?.length > 3 ? ` and ${order.items.length - 3} more` : ""
    const title = "New Order Received"
    const body = `${itemCount} item(s): ${preview}${suffix}`
    addToast({ title, body, type: "order" })
    notify(title, { body })
  })

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

      const sendEmail = httpsCallable(functions, "sendEmail");
      await sendEmail({
        template: "accessCode",
        to: user.email,
        data: { code },
      });

      alert(`${user.firstName}'s code: ${code}`);

    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="admin-login-page">
        <p>Loading…</p>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <AdminLogin />
  }

  async function declineRequest(user) {
    try {
      await updateDoc(
        doc(db, "waitlist", user.id),
        {
          status: "declined"
        }
      );
      const sendEmail = httpsCallable(functions, "sendEmail");
      await sendEmail({
        template: "waitlistRejected",
        to: user.email,
        data: { firstName: user.firstName },
      });
    } catch (error) {
      console.error(error)
    }
  }

  return (

    <div className="admin-page">
      <div className="admin-topbar">
        <span className="admin-user-email">
          {user.email}
        </span>
        <button
          className="admin-signout-button"
          onClick={signOut}
        >
          Sign out
        </button>
      </div>
      <button
        className="generate-code-button"
        onClick={generateSingleCode}
      >
        Generate Onetime Code
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
          {order.items.map((item, index) => (
            <p key={index}>
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
        ))
      }
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default Admin