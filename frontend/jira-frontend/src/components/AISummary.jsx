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
        "http://localhost:3000/api/jira/agent-report"
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

    const sections = summary
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean);

    if (sections.length === 0) {
      return (
        <p className="text-gray-300">
          No summary points are available.
        </p>
      );
    }

    return (
      <div className="space-y-6 text-gray-300">
        {sections.map((section, index) => {
          const lines = section
            .split(/\n/)
            .map((line) => line.trim())
            .filter(Boolean);

          if (lines.length === 0) return null;

          const cleanTitle = lines[0]
            .replace(/^#+\s*/, "")
            .replace(/^[-*]\s*/, "")
            .replace(/[:]+$/, "")
            .trim();
          const bodyLines = lines.slice(1);
          const paragraphText = bodyLines
            .map((line) =>
              line
                .replace(/^#+\s*/, "")
                .replace(/^[-*]\s*/, "")
                .trim()
            )
            .filter(Boolean)
            .join(" ");

          return (
            <div key={index} className="space-y-2">
              {cleanTitle && (
                <h3 className="text-base font-semibold text-white">
                  {cleanTitle}
                </h3>
              )}
              <p className="text-sm leading-7 text-gray-300">
                {paragraphText || section.replace(/^#+\s*/, "").replace(/^[-*]\s*/, "").trim()}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-[#081120] p-6 rounded-xl border border-[#16243d] shadow-lg shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">AI Summary</h2>
        <span className="text-xs uppercase tracking-wide text-gray-400">
          Executive Report
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={fetchAISummary}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
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
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md transition"
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