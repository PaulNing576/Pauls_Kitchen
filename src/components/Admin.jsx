import { useEffect, useState } from "react"

import app from "../firebase"

import {
  getFirestore,
  collection,
  onSnapshot
} from "firebase/firestore"

function Admin() {

  const [orders, setOrders] = useState([])
  const db = getFirestore(app)

  useEffect(() => {

    const unsubscribe = onSnapshot(

      collection(db, "orders"),

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

  return (

    <div className="admin-page">
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
        </div>
      ))}
    </div>
  )
}

export default Admin