"use client"

import { useState, useEffect, useCallback } from "react"
import useDrivePicker from "react-google-drive-picker"

interface UseGoogleDrivePickerOptions {
  clientId?: string
  developerKey?: string
  multiselect?: boolean
  viewId?: string
  showUploadView?: boolean
}

export function useGoogleDrivePicker(options: UseGoogleDrivePickerOptions = {}) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [lastSignInTime, setLastSignInTime] = useState<number | null>(null)

  const {
    clientId = "1003521158512-mvlpsqs3b05jq1u5f3868nhitbeb6uln.apps.googleusercontent.com",
    developerKey = "AIzaSyAlM_gVjAJgN1niu4mWtLwciN5Ej4uJBeM",
    multiselect = true,
    viewId = "DOCS",
    showUploadView = true,
  } = options

  const [openPicker] = useDrivePicker()

  // Check if user is still signed in (2 minutes session)
  useEffect(() => {
    const checkSignInStatus = () => {
      const storedSignInTime = localStorage.getItem("googleDriveSignInTime")
      if (storedSignInTime) {
        const signInTime = Number.parseInt(storedSignInTime)
        const currentTime = Date.now()
        const timeDiff = currentTime - signInTime

        // 2 minutes = 120000 milliseconds
        if (timeDiff < 120000) {
          setIsSignedIn(true)
          setLastSignInTime(signInTime)
        } else {
          // Session expired
          localStorage.removeItem("googleDriveSignInTime")
          setIsSignedIn(false)
          setLastSignInTime(null)
        }
      }
    }

    checkSignInStatus()

    // Check every 30 seconds
    const interval = setInterval(checkSignInStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  const openPickerWithAuth = useCallback(
    (callbackFunction: (data: any) => void) => {
      const currentTime = Date.now()

      openPicker({
        clientId,
        developerKey,
        viewId,
        showUploadView,
        showUploadFolders: true,
        supportDrives: true,
        multiselect,
        callbackFunction: (data) => {
          if (data.action === "picked") {
            // Update sign-in status and time
            setIsSignedIn(true)
            setLastSignInTime(currentTime)
            localStorage.setItem("googleDriveSignInTime", currentTime.toString())
          }
          callbackFunction(data)
        },
      })
    },
    [clientId, developerKey, viewId, showUploadView, multiselect, openPicker],
  )

  const getTimeRemaining = useCallback(() => {
    if (!lastSignInTime) return 0
    const currentTime = Date.now()
    const timeDiff = currentTime - lastSignInTime
    const remaining = 120000 - timeDiff // 2 minutes
    return Math.max(0, Math.floor(remaining / 1000)) // Return seconds
  }, [lastSignInTime])

  return {
    openPicker: openPickerWithAuth,
    isSignedIn,
    timeRemaining: getTimeRemaining(),
  }
}
