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
        "http://localhost:3000/api/jira/test-report-agent"
      );

      const data = await response.json();
      const reportText = data.report || data.reportText || "No AI summary available.";

      setSummary(reportText);
    } catch (err) {
      console.error("AI Summary Error:", err);
      setError("Failed to load AI summary.");
    } finally {
      setLoading(false);
    }
  };

  const renderSummaryPoints = () => {
    if (!summary) return null;

    const lines = summary
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return (
        <p className="text-gray-300">
          No summary points are available.
        </p>
      );
    }

    return (
      <div className="space-y-3 text-gray-300">
        {lines.map((line, index) => {
          const isSection = /^\d+\./.test(line);

          return (
            <p
              key={index}
              className={isSection ? "font-semibold text-white" : "leading-7"}
            >
              {line}
            </p>
          );
        })}
      </div>
    );
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
        <div className="space-y-3">
          {summary ? (
            renderSummaryPoints()
          ) : (
            <p className="text-gray-300">
              Click "Generate AI Summary" to create a summary.
            </p>
          )}
        </div>
      )}
    </div>
  );
}