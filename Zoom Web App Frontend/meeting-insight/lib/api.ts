const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Helper function for making authenticated requests
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include", // Important for session cookies
    headers: {
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// API functions for different endpoints
export const api = {
  // Auth related endpoints
  auth: {
    // Check if user is logged in (simplified for file upload approach)
    checkStatus: async () => {
      return true // Always return true since we're not using authentication
    },

    // Logout
    logout: async () => {
      localStorage.clear()
      window.location.href = "/"
    },
  },

  // Transcripts and analysis
  transcripts: {
    // Upload transcript files
    uploadFiles: async (files: File[]) => {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`transcript_${index}`, file)
      })

      return fetch(`${API_BASE_URL}/transcripts/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      }).then((res) => res.json())
    },

    // Analyze transcripts with custom prompt
    analyzeTranscripts: async (prompt: string, transcriptIds?: string[]) => {
      return fetchWithAuth("/transcripts/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          transcript_ids: transcriptIds,
        }),
      })
    },

    // Get all uploaded transcripts
    getAll: async () => {
      return fetchWithAuth("/transcripts")
    },

    // Delete transcript
    delete: async (id: string) => {
      return fetchWithAuth(`/transcripts/${id}`, {
        method: "DELETE",
      })
    },
  },

  // Sales preparation
  sales: {
    // Analyze LinkedIn profile and pitch deck
    analyzeSalesPrep: async (linkedinUrl: string, pitchDeckFile: File) => {
      const formData = new FormData()
      formData.append("linkedin_url", linkedinUrl)
      formData.append("pitch_deck", pitchDeckFile)

      return fetch(`${API_BASE_URL}/sales/analyze`, {
        method: "POST",
        body: formData,
        credentials: "include",
      }).then((res) => res.json())
    },
  },

  // // Export functionality
  // export: {
  //   // Download insights as Word document
  //   downloadWord: async (insights: any, filename: string) => {
  //     return fetchWithAuth("/export/word", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         insights,
  //         filename,
  //       }),
  //     }).then(async (response) => {
  //       const blob = await response.blob()
  //       const url = window.URL.createObjectURL(blob)
  //       const a = document.createElement("a")
  //       a.href = url
  //       a.download = `${filename}.docx`
  //       document.body.appendChild(a)
  //       a.click()
  //       window.URL.revokeObjectURL(url)
  //       document.body.removeChild(a)
  //     })
  //   },
  // },

  // // Google Drive integration
  // drive: {
  //   // Initialize Google Drive picker
  //   initializePicker: async () => {
  //     return new Promise((resolve, reject) => {
  //       if (typeof window !== "undefined" && window.google) {
  //         resolve(window.google)
  //       } else {
  //         // Load Google APIs
  //         const script = document.createElement("script")
  //         script.src = "https://apis.google.com/js/api.js"
  //         script.onload = () => {
  //           window.gapi.load("auth2:picker", () => {
  //             resolve(window.gapi)
  //           })
  //         }
  //         script.onerror = reject
  //         document.head.appendChild(script)
  //       }
  //     })
  //   },

    // // Download files from Google Drive
    // downloadFiles: async (fileIds: string[]) => {
    //   return fetchWithAuth("/drive/download", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ file_ids: fileIds }),
    //   })
    // },
  }

