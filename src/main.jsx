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

import './index.css'

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
