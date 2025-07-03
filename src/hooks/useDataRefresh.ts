"use client"

import { useState, useCallback } from "react"

export function useDataRefresh() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  return {
    refreshTrigger,
    triggerRefresh,
  }
}
