import { useState } from "react"

function AdminLogin({ onSuccess }) {

  const [password, setPassword] =
    useState("")

  function handleLogin() {
    if (password === "ningboyuan6A") {
      onSuccess()
    } else {

      alert("Wrong password")
    }
  }

  return (

    <div className="admin-login-page">
      <div className="admin-login-box">
        <h1>Admin Access</h1>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />
        <button onClick={handleLogin}>
          Enter Admin
        </button>
      </div>
    </div>
  )
}

export default AdminLogin