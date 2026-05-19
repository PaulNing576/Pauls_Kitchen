import { Link } from "react-router-dom"

import bgImage from "../images/landingBG.png"

function Landing() {

  return (
    <div
      className="landing-page"
      style={{
        backgroundImage: `url(${bgImage})`
      }}
    >
      <div className="landing-overlay">
        <h1 className="landing-title">
          ❤️ Paul's Kitchen ❤️
        </h1>
        <p className="landing-subtitle">
          Homemade food made with love
        </p>

        <Link
          to="/menu"
          className="enter-button"
        >
          Enter Menu
        </Link>

      </div>
    </div>
  )
}

export default Landing