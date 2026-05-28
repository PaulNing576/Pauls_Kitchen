import { useState, useEffect } from "react"
import "./Toast.css"

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!exiting) return
    const timer = setTimeout(() => onDismiss(toast.id), 200)
    return () => clearTimeout(timer)
  }, [exiting, onDismiss, toast.id])

  const className = [
    "toast-item",
    `toast-${toast.type}`,
    exiting ? "toast-exit" : "toast-enter",
  ].join(" ")

  return (
    <div className={className} onClick={() => setExiting(true)}>
      <div className="toast-title">{toast.title}</div>
      <div className="toast-body">{toast.body}</div>
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
