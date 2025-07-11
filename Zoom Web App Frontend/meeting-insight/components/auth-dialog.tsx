"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, User, Lock } from "lucide-react"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (user: { username: string; isAdmin: boolean }) => void
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simple validation
    if (!username || !password) {
      setError("Please enter both username and password")
      setIsLoading(false)
      return
    }

    // Email format validation
    if (!emailRegex.test(username)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user is admin (contains "admin" in username)
    const isAdmin = username.toLowerCase().includes("admin")

    // Store user info in localStorage
    const userInfo = { username, isAdmin }
    localStorage.setItem("userInfo", JSON.stringify(userInfo))

    setIsLoading(false)
    onSuccess(userInfo)
    onOpenChange(false)

    // Reset form
    setUsername("")
    setPassword("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Welcome to Sherpa.AI</DialogTitle>
          <DialogDescription className="text-center">
            Please sign in to access your AI-powered transcript analysis
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Email Address</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                type="email"
                placeholder="Enter your email address"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 to-black hover:from-yellow-600 hover:to-gray-800"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Get Started"}
          </Button>
        </form>
        <p className="text-xs text-center text-gray-500 mt-4">
          💡 Tip: Use an email containing "admin" for advanced features
        </p>
      </DialogContent>
    </Dialog>
  )
}
