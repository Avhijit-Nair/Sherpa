"use client"

import { useState, useEffect } from "react"

export interface User {
  username: string
  isAdmin: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("userInfo")
        if (storedUser) {
          const userInfo = JSON.parse(storedUser)
          setUser(userInfo)
        }
      } catch (error) {
        console.error("Failed to parse user info:", error)
        localStorage.removeItem("userInfo")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userInfo: User) => {
    setUser(userInfo)
    localStorage.setItem("userInfo", JSON.stringify(userInfo))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("userInfo")
    // Clear other stored data
    localStorage.removeItem("uploadedFiles")
    localStorage.removeItem("salesPresentations")
    sessionStorage.clear()
    // Redirect to home page
    window.location.href = "/"
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  }
}
