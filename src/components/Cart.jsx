function Cart({
  cart,
  removeFromCart,
  cartOpen,
  setCartOpen,
  placeOrder
}) {

  return (
    <div className="cart-bar">
      <div
        className="cart-header"
        onClick={() => setCartOpen(!cartOpen)}
      >
        <h3>🛒 Cart ({cart.length})</h3>
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