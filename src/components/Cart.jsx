function Cart({
  cart,
  removeFromCart,
  cartOpen,
  setCartOpen,
  placeOrder
}) {

      const totalPrice = cart.reduce((total, item) => {

    return total + item.price * item.quantity

  }, 0)

  return (
    <div className="cart-bar">
      <div
        className="cart-header"
        onClick={() => setCartOpen(!cartOpen)}
      >
        <h3>
          🛒 Cart (
          {cart.reduce((total, item) => {
            return total + item.quantity
          }, 0)}
          )
        </h3>
      </div>
      {cartOpen && (
        <div>
          {cart.map((item, index) => (
            <div className="cart-item">
              <p>
                {item.name} x{item.quantity}
              </p>
              <button
                onClick={() => removeFromCart(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <h3 className="total-price">
            Total: ${totalPrice}
          </h3>
          <button
            className="place-order-button"
            onClick={placeOrder}
          >
            Place Order
          </button>

        </div>
      )}
    </div>
  )
}

export default Cart