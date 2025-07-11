"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"

type Recording = {
  id: string
  title: string
  date: string
  duration: string
  participants: number
  hasTranscript: boolean
  hasAnalysis?: boolean
}

type UseRecordingsOptions = {
  initialPage?: number
  limit?: number
  search?: string
  autoFetch?: boolean
}

export function useRecordings(options: UseRecordingsOptions = {}) {
  const { initialPage = 1, limit = 10, search = "", autoFetch = true } = options

  const [recordings, setRecordings] = useState<Recording[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState(search)

  const fetchRecordings = useCallback(
    async (pageToFetch = page, query = searchQuery) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await api.recordings.getAll({
          page: pageToFetch,
          limit,
          search: query,
        })

        setRecordings(response.data)
        setTotalPages(response.totalPages || 1)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch recordings"))
      } finally {
        setIsLoading(false)
      }
    },
    [page, limit, searchQuery],
  )

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchRecordings()
    }
  }, [autoFetch, fetchRecordings])

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      setPage(1) // Reset to first page when searching
      fetchRecordings(1, query)
    },
    [fetchRecordings],
  )

  // Handle pagination
  const goToPage = useCallback(
    (newPage: number) => {
      setPage(newPage)
      fetchRecordings(newPage)
    },
    [fetchRecordings],
  )

  return {
    recordings,
    isLoading,
    error,
    page,
    totalPages,
    searchQuery,
    handleSearch,
    goToPage,
    refetch: fetchRecordings,
  }
}
