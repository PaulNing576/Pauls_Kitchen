import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react"

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut
} from "firebase/auth"

import { auth } from "../firebase"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {

        if (!firebaseUser) {
          setUser(null)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        const tokenResult =
          await firebaseUser.getIdTokenResult()

        setUser(firebaseUser)
        setIsAdmin(
          tokenResult.claims.admin === true
        )
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  async function signIn(email, password) {

    const cred = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )

    // Force refresh so a freshly granted claim is picked up
    // without requiring the user to log out and back in.
    const tokenResult =
      await cred.user.getIdTokenResult(true)

    setUser(cred.user)
    setIsAdmin(tokenResult.claims.admin === true)

    return {
      user: cred.user,
      isAdmin: tokenResult.claims.admin === true
    }
  }

  async function signOut() {
    await fbSignOut(auth)
    setUser(null)
    setIsAdmin(false)
  }

  return (

    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {

  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error(
      "useAuth must be used inside <AuthProvider>"
    )
  }

  return ctx
}
