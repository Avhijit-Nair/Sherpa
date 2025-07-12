
const BASE_URL = "https://zoom-transcript-analyzer.uc.r.appspot.com";

export const sendTranscriptLine = async (line) => {
  await fetch(`${BASE_URL}/transcribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(line),
  });
};

export const generateProposal = async (prompt, fileId) => {
  const res = await fetch(`${BASE_URL}/api/salesproposal2`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, fileId }),
  });
  return await res.json();
};

export const generatePrepWork = async (prompt, linkedinUrl, presentations) => {
  const res = await fetch(`${BASE_URL}/api/salesprep2`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, linkedinUrl, presentations }),
  });
  return await res.json();
};
