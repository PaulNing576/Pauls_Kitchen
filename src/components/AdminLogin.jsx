import { useState } from "react"

import { useAuth } from "../contexts/AuthContext"

function AdminLogin() {

  const { signIn, signOut } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin() {

    setError("")
    setSubmitting(true)

    try {
      const result = await signIn(email, password)

      if (!result.isAdmin) {
        await signOut()
        setError("This account is not an admin.")
      }
    } catch (e) {
      const code = e && e.code ? e.code : ""

      if (code === "auth/invalid-credential" ||
          code === "auth/wrong-password" ||
          code === "auth/user-not-found") {
        setError("Invalid email or password.")
      } else if (code === "auth/too-many-requests") {
        setError(
          "Too many attempts. Try again later."
        )
      } else {
        setError(
          e.message || "Sign-in failed."
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (

    <div className="admin-login-page">
      <div className="admin-login-box">
        <h1>Admin Access</h1>

        <input
          type="email"
          placeholder="Email"
          autoComplete="username"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !submitting) {
              handleLogin()
            }
          }}
        />

        <button
          onClick={handleLogin}
          disabled={submitting}
        >
          {submitting ? "Signing in…" : "Enter Admin"}
        </button>

        {error && (
          <p className="admin-login-error">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default AdminLogin
