import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import toast, { Toaster } from "react-hot-toast";
import {
  FaRobot,
  FaFilePdf,
  FaSpinner,
  FaCopy,
  FaDownload,
} from "react-icons/fa";

import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [studyMode, setStudyMode] = useState("notes");
  const copyNotes = () => {
  if (!notes) return;

  navigator.clipboard.writeText(notes);
 toast.success("Notes copied successfully!");
};
  const downloadNotes = () => {
  if (!notes) return;

  const blob = new Blob([notes], {
    type: "text/plain",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = "AI_Notes.txt";

  a.click();

  window.URL.revokeObjectURL(url);
};
  const generateNotes = async () => {
    if (!file) {
      toast.error("Please select a PDF");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("study_mode", studyMode);
    let interval;
    try {
      setLoading(true);
      setProgress(5);

interval = setInterval(() => {
  setProgress((prev) => {
    if (prev >= 90) return prev;
    return prev + 10;
  });
}, 400);

      const response = await axios.post(
        "http://localhost:8000/upload-pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      clearInterval(interval);
setProgress(100);
      setNotes(response.data.notes);
      toast.success("Notes generated successfully!");
          } catch (error) {
  console.log(error);
  toast.error("Something went wrong!");
} finally {
  clearInterval(interval);

  setLoading(false);

  setTimeout(() => {
    setProgress(0);
  }, 1000);
}
  };
return (
  <>
    <Toaster position="top-right" />

    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold flex items-center justify-center gap-3">
            <FaRobot className="text-blue-400" />
            AI Notes Generator
          </h1>

          <p className="mt-4 text-slate-300 text-lg">
            Upload any PDF and generate AI-powered study notes instantly.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-700">
          <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-blue-500 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-slate-800 transition mb-6">

            <FaFilePdf className="text-6xl text-blue-400 mb-4" />

            <p className="text-xl font-semibold">
              Click to Upload PDF
            </p>

            <p className="text-slate-400 mt-2">
              {file ? file.name : "No file selected"}
            </p>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />

          </label>
<div className="mb-6">
  <label className="block mb-2 text-lg font-semibold">
    Select Study Mode
  </label>

  <select
    value={studyMode}
    onChange={(e) => setStudyMode(e.target.value)}
    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3"
  >
    <option value="notes">📖 Notes</option>
    <option value="summary">📝 Summary</option>
    <option value="quiz">❓ Quiz</option>
    <option value="flashcards">📚 Flashcards</option>
    <option value="viva">🎤 Viva Questions</option>
  </select>
</div>
{loading && (
  <div className="mb-6">

    <div className="flex justify-between mb-2">
      <span>Generating AI Notes...</span>
      <span>{progress}%</span>
    </div>

    <div className="w-full bg-slate-700 rounded-full h-3">
      <div
        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      ></div>
    </div>

  </div>
)}
          <button
            onClick={generateNotes}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition rounded-xl py-4 text-xl font-semibold flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FaFilePdf />
                Generate Notes
              </>
            )}
          </button>

        </div>  
                <div className="bg-slate-900 rounded-2xl shadow-xl mt-10 p-8 border border-slate-700">

      <div className="flex items-center justify-between mb-6">

  <h2 className="text-3xl font-bold">
    Generated Notes
  </h2>

  {notes && (
    <div className="flex gap-3">

      <button
        onClick={copyNotes}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <FaCopy />
        Copy
      </button>

      <button
        onClick={downloadNotes}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <FaDownload />
        Download
      </button>

    </div>
  )}

</div>

          <div className="prose prose-invert max-w-none">

            {notes ? (
              <ReactMarkdown>
                {notes}
              </ReactMarkdown>
            ) : (
              <p className="text-slate-400">
                Your AI generated notes will appear here...
              </p>
            )}

          </div>

        </div>

           </div>
    </div>
  </>
);
}

export default App;     