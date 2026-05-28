import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBLomRpkplDWjApwMkPBP8_nDGFFn_csFo",
  authDomain: "pauls-kitchen-bf4e6.firebaseapp.com",
  projectId: "pauls-kitchen-bf4e6",
  storageBucket: "pauls-kitchen-bf4e6.firebasestorage.app",
  messagingSenderId: "763426487194",
  appId: "1:763426487194:web:5353373f5ec34ccb819823",
  measurementId: "G-QJVDXSPV56"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const functions = getFunctions(app, "us-central1")

if (import.meta.env.DEV && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === "true") {
  connectFunctionsEmulator(functions, "localhost", 5001)
}
export const auth = getAuth(app)
export default app