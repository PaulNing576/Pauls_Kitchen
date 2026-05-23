import { useState } from "react"

import imageMap from "../utils/imageMap"

/* ui imports */
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"
import Modal from "../components/ui/Modal"

function Menu({
  menu,
  addToCart,
  selectedCategory,
  setSelectedCategory
}) {

  const [animatedItem, setAnimatedItem] = useState(-1)

  function handleAddToCart(item, index) {

    addToCart(item)

    setAnimatedItem(index)

    setTimeout(() => {
      setAnimatedItem(-1)
    }, 500)
  }

  const categories = [
    "Appetizer",
    "Vege",
    "Pork",
    "Chicken",
    "Beef & Lamb",
    "Seafood",
    "Rice Bowls",
    "Soup",
    "Staples",
    "Specials",
    "Drinks"
  ]

  const filteredMenu = menu.filter((item) => {
    return item.category === selectedCategory
  })

  return (
    <div className="menu-layout">
      <div className="sidebar">
        {categories.map((category) => (
          <button
            key={category}
            className="category-button"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}

      </div>
      <div className="food-section">
        {filteredMenu.map((item, index) => (
          <div
            key={item.name}
            className={
              animatedItem === index
                ? "food-card animate"
                : "food-card"
            }
          >
            <div className="food-info">
              <h3>{item.name}</h3>
              <p>${item.price}</p>
              <Button
                type="tertiary"
                onClick={() => handleAddToCart(item, index)}
              >
                Add
              </Button>
            </div>
            <img
              className="food-image"
              src={imageMap[item.image]}
              alt={item.name}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Menu