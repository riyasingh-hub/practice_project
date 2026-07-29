import { useState } from "react";

export default function AISummary() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAISummary = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "http://localhost:3000/api/jira-data/ai-summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({})
        }
      );

      const data = await response.json();

      setSummary(data.aiSummary || data.rawResponse || "No AI summary available.");
    } catch (err) {
      console.error("AI Summary Error:", err);
      setError("Failed to load AI summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#081120] p-6 rounded-xl border border-[#16243d]">
      <h2 className="text-xl mb-4">AI Summary</h2>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={fetchAISummary}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate AI Summary"}
        </button>

        {summary && (
          <button
            onClick={() => {
              setSummary("");
              setError("");
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <p className="text-gray-300 leading-8 whitespace-pre-line">
          {summary || "Click \"Generate AI Summary\" to create a summary."}
        </p>
      )}
    </div>
  );
}