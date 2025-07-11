"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Upload, Brain, Trash2, Sparkles, CheckCircle2, Clock, FileIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import useDrivePicker from "react-google-drive-picker"
import { useAuth } from "@/hooks/use-auth"
import { LogoutButton } from "@/components/logout-button"
import { useGoogleDrivePicker } from "@/hooks/use-google-drive-picker"


type FileData = {
  id: string
  name: string
  uploadDate: string
  size: string
  analyzed: boolean
  type: string
  mimeType?: string
  downloadUrl?: string
  content?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const [files, setFiles] = useState<FileData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  // Google Drive Picker with both Drive and Upload functionality
   const { openPicker, isSignedIn, timeRemaining } = useGoogleDrivePicker({
    multiselect: true,
    showUploadView: true,
  })


  useEffect(() => {
if (!authLoading && !isAuthenticated) {
      router.push("/")
      return
    }

    // Load files from localStorage
    const savedFiles = localStorage.getItem("uploadedFiles")
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles)
        setFiles(parsedFiles)
      } catch (error) {
        console.error("Failed to parse saved files:", error)
      }
    }
  }, [isAuthenticated, router])

  const saveFilesToStorage = (updatedFiles: FileData[]) => {
    localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles))
    setFiles(updatedFiles)
  }

  // const logoutFromApp = () => {
  //   logout()
  // }
    // Clear local storage and session storage
  // Function 1: Connect Google Drive and File Picker
  const handleOpenPicker = () => {
    openPicker((data) => {
      if (data.action === "picked") {
        setIsLoading(true)
        setUploadProgress(0)
        setError(null)

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressInterval)
              return 100
            }
            return prev + 10
          })
        }, 200)

          try {
            const newFiles: FileData[] = data.docs.map((doc: any, index: number) => ({
              id: `file_${Date.now()}_${index}`,
              name: doc.name,
              uploadDate: new Date().toLocaleDateString(),
              size: doc.sizeBytes ? `${(doc.sizeBytes / 1024).toFixed(1)} KB` : "Unknown",
              analyzed: false,
              type: doc.name.split(".").pop()?.toLowerCase() || "txt",
              mimeType: doc.mimeType,
              downloadUrl: doc.id,
              content: doc.content || "", // For uploaded files, content might be available
            }))
           
            setTimeout(() => {
              const updatedFiles = [...files, ...newFiles]
              saveFilesToStorage(updatedFiles)
              setIsLoading(false)
              setUploadProgress(0)
            }, 2000)
          } catch (error) {
            setError("Failed to process selected files.")
            setIsLoading(false)
            setUploadProgress(0)
          }
        }
      
    })
  }

  const handleDeleteFile = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const updatedFiles = files.filter((f) => f.id !== id)
    saveFilesToStorage(updatedFiles)
    setSelectedFiles(selectedFiles.filter((fId) => fId !== id))
  }

  const handleSelectFile = (id: string) => {
    setSelectedFiles((prev) => {
      if (prev.includes(id)) {
        return prev.filter((fId) => fId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(files.map((f) => f.id))
    }
  }

  // Function 2: Send files array to /analyze route
  const handleAnalyzeSelected = () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file to analyze.")
      return
    }

    const selectedFileData = files.filter((f) => selectedFiles.includes(f.id))

    // Store the complete file array for the analyze route
    sessionStorage.setItem("selectedFiles", JSON.stringify(selectedFileData))

    router.push("/analyze")
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileIcon className="h-8 w-8 text-red-500" />
      case "docx":
      case "doc":
        return <FileIcon className="h-8 w-8 text-blue-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-yellow-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="relative">
              <FileText className="h-6 w-6 text-yellow-500" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-black animate-pulse" />
            </div>
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-black to-yellow-500 bg-clip-text text-transparent"
            >
              Sherpa.AI
            </Link>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/"  className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors">
              Home
               <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
             <Link href="/dashboard" className="text-sm font-medium text-yellow-500 relative group">
                          Transcript Analyzer
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
            <Link
              href="/sales-prep"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors"
            >
              Sales Prep
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
           
             <Link
              href="/sales-proposal"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors"
            >
              Sales Proposal
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <button
              onClick={() => {
                logout()
                window.location.assign("/")
              }}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors"
            >
              Logout ({user?.username})
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          {error && (
            <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2 duration-300 max-w-4xl mx-auto">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-yellow-500 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                AI-Powered Analysis
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-yellow-500 to-black bg-clip-text text-transparent">
                Transform Your Transcripts
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Upload your meeting transcripts and let AI generate powerful insights to improve your sales process
              </p>
            </div>

            
            {/* Files Section */}
            {files.length > 0 && (
              <div className="space-y-6">
                {/* Selection Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-6 bg-white rounded-xl border shadow-sm max-w-5xl mx-auto">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-gray-900">Uploaded Files ({files.length})</h2>
                    <p className="text-sm text-gray-500">
                      Select files to analyze individually or generate collective insights
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="hover:bg-gray-50 hover:border-yellow-500 transition-all duration-200 cursor-pointer"
                    >
                      {selectedFiles.length === files.length ? "Deselect All" : "Select All"}
                    </Button>
                    {selectedFiles.length > 0 && (
                      <Button
                        size="sm"
                        onClick={handleAnalyzeSelected}
                        className="bg-gradient-to-r from-yellow-500 to-black hover:from-yellow-600 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg text-white cursor-pointer"
                      >
                        <Brain className="mr-2 h-4 w-4 " />
                        Analyze {selectedFiles.length > 1 ? `${selectedFiles.length} Files` : "Selected"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Selected Files Banner */}
                {selectedFiles.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-gray-50 border border-yellow-200 rounded-xl animate-in slide-in-from-top-2 duration-300 max-w-5xl mx-auto">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">
                        {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
                      </span>
                      <Badge variant="secondary" className="ml-auto">
                        Ready for analysis
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Files Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                  {files.map((file, index) => (
                    <Card
                      key={file.id}
                      className={cn(
                        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer",
                        selectedFiles.includes(file.id)
                          ? "ring-2 ring-yellow-500 shadow-lg bg-gradient-to-br from-yellow-50 to-gray-50"
                          : "hover:shadow-lg border-gray-200 hover:border-yellow-300",
                      )}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                      onClick={() => handleSelectFile(file.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="relative">
                              {getFileIcon(file.type)}
                              {file.analyzed && (
                                <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm font-medium truncate group-hover:text-yellow-600 transition-colors">
                                {file.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {file.type.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-gray-500">{file.size}</span>
                              </div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleSelectFile(file.id)
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 transition-all duration-200"
                          />
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {file.uploadDate}
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                              file.analyzed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600",
                            )}
                          >
                            <div
                              className={cn("h-1.5 w-1.5 rounded-full", file.analyzed ? "bg-green-500" : "bg-gray-400")}
                            />
                            {file.analyzed ? "Analyzed" : "Not analyzed"}
                          </div>
                        </div>

                        {/* Delete Button - Outside card animation */}
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDeleteFile(file.id, e)}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
                  {isLoading && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-200 border-t-yellow-600"></div>
                        <span className="text-sm text-yellow-500 font-medium">Uploading files...</span>
                      </div>
                      <div className="max-w-xs mx-auto">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{uploadProgress}% complete</p>
                      </div>
                    </div>
                  )}
                  {/* File Picker Section */}
            <Card className="border-2 border-dashed border-gray-200 hover:border-yellow-500 transition-all duration-300 hover:shadow-lg max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="relative mx-auto w-16 h-16">
                    <Upload className="w-16 h-16 mx-auto text-gray-400" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Files</h3>
                      <p className="text-sm text-gray-500">Choose files from your computer or Google Drive</p>
                      <p className="text-sm text-red-500"><span>Note - The files should be enabled to share with anyone with the link.</span></p>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleOpenPicker}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-yellow-500 to-black hover:from-yellow-600 hover:to-gray-800 transition-all duration-200 text-white"
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      {isLoading ? "Processing..." : "Choose Files"}
                    </Button>

                    <p className="text-xs text-gray-500">
                      Supports local files and Google Drive. Multiple file selection available.
                    </p>
                  </div>
                  
                </div>
              </CardContent>
            </Card>


            {/* Empty State */}
            {files.length === 0 && (
              <Card className="border-dashed border-2 border-gray-200 max-w-4xl mx-auto">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="relative mb-4">
                    <FileText className="h-16 w-16 text-gray-300" />
                    <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No files uploaded yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    Upload your first transcript files to start generating AI-powered insights for your meetings
                  </p>
                  <Button
                    className="bg-gradient-to-r from-yellow-500 to-black hover:from-yellow-600 hover:to-gray-800 transition-all duration-200 text-white"
                    onClick={handleOpenPicker}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Your First Files
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
