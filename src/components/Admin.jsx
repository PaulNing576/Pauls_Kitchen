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
  addDoc
}
from "firebase/firestore"

import generateCode from "../utils/generateCode"
import AdminLogin from "./AdminLogin"

function Admin() {

  const [authenticated, setAuthenticated] = useState(false)
  const [orders, setOrders] = useState([])
  const db = getFirestore(app)

  useEffect(() => {

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

    return () => unsubscribe()

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

  if (!authenticated) {
    return (
      <AdminLogin
        onSuccess={() =>
          setAuthenticated(true)
        }
      />
    )
  }

  return (

    <div className="admin-page">
      <button
        className="generate-code-button"
        onClick={generateSingleCode}
      >
        Generate Invite Code
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
    </div>
  )
}

export default Admin