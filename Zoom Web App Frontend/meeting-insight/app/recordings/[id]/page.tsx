import RecordingClientPage from "./RecordingClientPage"

export function generateStaticParams() {
  // Pre-render pages for our mock recordings
  return [{ id: "rec1" }, { id: "rec2" }, { id: "rec3" }, { id: "rec4" }, { id: "rec5" }]
}

export default function RecordingPage() {
  return <RecordingClientPage />
}
