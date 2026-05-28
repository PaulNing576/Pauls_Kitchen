import { useEffect, useRef } from "react"

export default function useNewItemDetector(items, keyField, onNewItem) {
  const seenIds = useRef(new Set())
  const onNewItemRef = useRef(onNewItem)

  useEffect(() => {
    onNewItemRef.current = onNewItem
  })

  useEffect(() => {
    if (!items || items.length === 0) return

    const currentIds = new Set()
    for (const item of items) {
      if (item[keyField] != null) currentIds.add(item[keyField])
    }

    if (seenIds.current.size === 0) {
      seenIds.current = currentIds
      return
    }

    for (const item of items) {
      if (!seenIds.current.has(item[keyField])) {
        onNewItemRef.current(item)
      }
    }

    seenIds.current = currentIds
  }, [items, keyField])
}
