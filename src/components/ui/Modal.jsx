import { useEffect, useState } from "react"
import "./Modal.css"

export default function Modal({
  isOpen,
  title,
  children,
  onClose 
}) {

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
    } else {
      const timeout = setTimeout(() => {
        setVisible(false)
      }, 200)
      return () =>
        clearTimeout(timeout)
    }
  }, [isOpen])

  if (!visible) return null

  return (

    <div className="modal-overlay">
      <div
        className={
          isOpen
            ? "modal-content modal-open"
            : "modal-content modal-close"
        }
      >
        <h2>
          {title}
        </h2>
        <div className="modal-body">
          {children}
        </div>
        <button
          className="modal-close-button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}