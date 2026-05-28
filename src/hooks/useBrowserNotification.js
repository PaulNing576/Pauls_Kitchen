import { useState, useCallback, useEffect } from "react"

export default function useBrowserNotification() {
  const [permission, setPermission] = useState(
    () => (typeof Notification !== "undefined" ? Notification.permission : "denied"),
  )

  useEffect(() => {
    if (typeof Notification === "undefined") return
    if (Notification.permission !== "default") return
    Notification.requestPermission().then((p) => setPermission(p))
  }, [])

  const notify = useCallback((title, { body } = {}) => {
    if (typeof Notification === "undefined") return
    if (Notification.permission !== "granted") return
    new Notification(title, { body, icon: "/favicon.svg" })
  }, [])

  return { notify, permission }
}
