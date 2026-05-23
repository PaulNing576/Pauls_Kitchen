/* ui imports */
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"
import Modal from "../components/ui/Modal"

function Cart({
  cart,
  removeFromCart,
  cartOpen,
  setCartOpen,
  goToCheckout
}) {

      const totalPrice = cart.reduce((total, item) => {

    return total + item.price * item.quantity

  }, 0)

  return (
    <div className="cart-bar">
      <div
        className="cart-header"
      >
        <h3>
          🛒 Cart (
          {cart.reduce((total, item) => {
            return total + item.quantity
          }, 0)}
          )
        </h3>
        {!cartOpen && (
          <button
            className="cart-toggle-button"
            onClick={() => setCartOpen(!cartOpen)}
          >
            Open Cart
          </button>
        )}
        {cartOpen && (
          <button
            className="cart-toggle-button"
            onClick={() => setCartOpen(!cartOpen)}
          >
            Close Cart
          </button>
        )}
      </div>
      {cartOpen && (
        <div>
          {cart.map((item, index) => (
            <div
              key={item.name}
              className="cart-item"
            >
              <p>
                {item.name} x{item.quantity}
              </p>
              <Button
                type="tertiary"
                onClick={() => removeFromCart(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <h3 className="total-price">
            Total: ${totalPrice}
          </h3>
          <button
            className="place-order-button"
            onClick={goToCheckout}
          >
            Checkout
          </button>

        </div>
      )}
    </div>
  )
}

export default Cart