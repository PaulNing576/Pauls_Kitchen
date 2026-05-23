import React from 'react'
import ReactDOM from 'react-dom/client'

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"

import App from './App'
import Admin from './components/Admin'
import Landing from './components/Landing'

import "./styles/global.css"
import "./styles/landing.css"
import "./styles/menu.css"
import "./styles/checkout.css"
import "./styles/admin.css"
import "./styles/cart.css"

ReactDOM.createRoot(document.getElementById('root')).render(

  <BrowserRouter>

    <Routes>

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/menu"
        element={<App />}
      />

      <Route
        path="/admin"
        element={<Admin />}
      />

    </Routes>

  </BrowserRouter>
)
