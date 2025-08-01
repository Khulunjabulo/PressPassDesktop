//Error Handler
"use client"

import { useEffect } from "react"

export default function useErrorHandler(error) {
  useEffect(() => {
    console.error(error)
  }, [error])
}
