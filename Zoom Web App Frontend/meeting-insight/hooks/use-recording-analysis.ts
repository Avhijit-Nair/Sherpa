"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

type AnalysisStatus = "idle" | "pending" | "processing" | "completed" | "failed"

type UseRecordingAnalysisOptions = {
  recordingId: string
  redirectOnComplete?: boolean
  pollInterval?: number
}

export function useRecordingAnalysis(options: UseRecordingAnalysisOptions) {
  const { recordingId, redirectOnComplete = true, pollInterval = 2000 } = options
  const router = useRouter()

  const [status, setStatus] = useState<AnalysisStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [statusMessage, setStatusMessage] = useState("Preparing to analyze...")

  // Start the analysis process
  const startAnalysis = useCallback(async () => {
    setStatus("pending")
    setProgress(0)
    setError(null)

    try {
      const response = await api.analysis.start(recordingId)
      setAnalysisId(response.analysisId)
      setStatus("processing")
      setStatusMessage("Processing audio...")
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to start analysis"))
      setStatus("failed")
    }
  }, [recordingId])

  // Check the status of an ongoing analysis
  const checkStatus = useCallback(async () => {
    if (!analysisId || status !== "processing") return

    try {
      const response = await api.analysis.getStatus(analysisId)

      setProgress(response.progress || 0)

      // Update status message based on progress
      if (response.progress < 25) {
        setStatusMessage("Processing audio...")
      } else if (response.progress < 50) {
        setStatusMessage("Analyzing content...")
      } else if (response.progress < 75) {
        setStatusMessage("Generating insights...")
      } else {
        setStatusMessage("Finalizing results...")
      }

      if (response.status === "completed") {
        setStatus("completed")
        setProgress(100)

        if (redirectOnComplete) {
          // Redirect to insights page after a short delay
          setTimeout(() => {
            router.push(`/recordings/${recordingId}/insights`)
          }, 1000)
        }
      } else if (response.status === "failed") {
        setStatus("failed")
        setError(new Error(response.error || "Analysis failed"))
      }
    } catch (err) {
      console.error("Error checking analysis status:", err)
      // Don't set failed status here, just log the error and continue polling
    }
  }, [analysisId, recordingId, redirectOnComplete, router, status])

  // Poll for status updates
  useEffect(() => {
    if (status !== "processing") return

    const intervalId = setInterval(checkStatus, pollInterval)

    return () => clearInterval(intervalId)
  }, [checkStatus, pollInterval, status])

  return {
    status,
    progress,
    statusMessage,
    error,
    startAnalysis,
  }
}
