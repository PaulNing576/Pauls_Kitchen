import { useState } from "react"
import { useNavigate } from "react-router-dom"

import Menu from "./components/Menu"
import Cart from "./components/Cart"
import menu from "./data/menu"
import Checkout from "./components/Checkout"

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
  const [currentPage, setCurrentPage] =
    useState("menu")

  const navigate = useNavigate()

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

  async function placeOrder(codeData) {
    try {
      await addDoc(
        collection(db, "orders"),
        {
          items: cart,
          createdAt: new Date()
        }
      )

      if (
        codeData.type === "single"
        ||
        codeData.type === "guest"
      ) {
        await updateDoc(
          doc(db, "codes", codeData.id),
          {
            used: true
          }
        )
      }

      alert("Order placed! You will received a confirm email shortly.")
      setCart([])
      navigate("/")

    } catch (error) {
      console.log(error)
      alert("Failed to place order")
    }
  }

  return (
    <div>
      {
        currentPage === "menu" && (
          <>
            <div className="menu-title-box">
              <h1 className="menu-title">
                Paul 's Kitchen
              </h1>
            </div>

            <Menu
              menu={menu}
              addToCart={addToCart}
              selectedCategory={selectedCategory}
              setSelectedCategory={
                setSelectedCategory
              }
            />

            <Cart
              cart={cart}
              removeFromCart={removeFromCart}
              cartOpen={cartOpen}
              setCartOpen={setCartOpen}
              goToCheckout={() => {
                if (cart.length === 0) {
                  alert("Cart is empty")
                  return
                }
                setCurrentPage("checkout")
              }}
            />
          </>
        )
      }

      {

        currentPage === "checkout" && (

          <Checkout
            cart={cart}
            placeOrder={placeOrder}
            setCurrentPage={setCurrentPage}
            verifyCode={verifyCode}
          />
        )
      }

    </div>
  )
}

export default App