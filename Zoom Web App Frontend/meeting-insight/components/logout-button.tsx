"use client"

import type React from "react"

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
  onClick?: () => void
}

export function LogoutButton({ className, children, onClick }: LogoutButtonProps) {
  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem("userInfo")
    localStorage.removeItem("uploadedFiles")
    localStorage.removeItem("salesPresentations")
    sessionStorage.clear()

    // Call custom onClick if provided
    if (onClick) {
      onClick()
    }

    // Redirect to home page
    window.location.href = "/"
  }

  return (
    <button onClick={handleLogout} className={className}>
      {children || "Logout"}
    </button>
  )
}
