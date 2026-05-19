import { useState } from "react"

import Menu from "./components/Menu"
import Cart from "./components/Cart"
import menu from "./data/menu"

import app from "./firebase"

import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore"

function App() {

  const db = getFirestore(app)

  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] =
    useState("Main Dishes")
  const [cartOpen, setCartOpen] = useState(false)

  function addToCart(item) {
    const existingItem = cart.find((cartItem) => {
      return cartItem.name === item.name
    })
    if (existingItem) {
      const updatedCart = cart.map((cartItem) => {
        if (cartItem.name === item.name) {
          return {
            ...cartItem,
            quantity: cartItem.quantity + 1
          }
        }
        return cartItem
      })
      setCart(updatedCart)
    } else {
      setCart([
        ...cart,
        {
          ...item,
          quantity: 1
        }
      ])
    }
  }

  function removeFromCart(indexToRemove) {
    const targetItem = cart[indexToRemove]
    if (targetItem.quantity > 1) {
      const updatedCart = cart.map((item, index) => {
        if (index === indexToRemove) {
          return {
            ...item,
            quantity: item.quantity - 1
          }
        }
        return item
      })
      setCart(updatedCart)
    } else {
      const newCart = cart.filter((item, index) => {
        return index !== indexToRemove
      })
      setCart(newCart)
    }
  }

  async function verifyCode(inputCode) {

    const codesRef = collection(db, "codes")

    const q = query(
      codesRef,
      where("code", "==", inputCode)
    )

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const codeDoc = querySnapshot.docs[0]
    const codeData = codeDoc.data()

    if (
      codeData.type === "single"
      &&
      codeData.used === true
    ) {
      return null
    }

    return {
      id: codeDoc.id,
      ...codeData
    }
  }

  async function placeOrder() {
    const inputCode = prompt(
      "Please enter your access code"
    )

    if (!inputCode) {
      return
    }

    const validCode = await verifyCode(inputCode)

    if (!validCode) {
      alert("Invalid or used code")
      return
    }
    
    if (cart.length === 0) {
      alert("Cart is empty")
      return
    }
    try {
      await addDoc(
        collection(db, "orders"),
        {
          items: cart,
          createdAt: new Date()
        }
      )

      if (validCode.type === "single") {
        const codeRef = doc(
          db,
          "codes",
          validCode.id
        )
        await updateDoc(codeRef, {
          used: true
        })
      }

      alert("Order placed!")
      setCart([])
    } catch (error) {
      console.log(error)
      alert("Failed to place order")
    }
  }

  return (
    <div>

      <h1>❤️ Welcome to Paul's Kitchen ❤️</h1>

      <Menu
        menu={menu}
        addToCart={addToCart}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <Cart
        cart={cart}
        removeFromCart={removeFromCart}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        placeOrder={placeOrder}
      />

    </div>
  )
}

export default App