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
    <div className="bg-gradient-to-br from-[#081120] via-[#0d1728] to-[#111c31] p-6 md:p-8 rounded-2xl border border-[#1b2d4a] shadow-xl shadow-blue-950/20">
  {/* Header */}
  <div className="flex items-center gap-3 mb-6">
    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20">
      ✨
    </div>

    <div>
      <h2 className="text-2xl font-bold text-white">
        AI Summary
      </h2>
      <p className="text-sm text-gray-400">
        Generate an intelligent project summary
      </p>
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex flex-wrap items-center gap-3 mb-6">
    <button
      onClick={fetchAISummary}
      disabled={loading}
      className="
        px-5 py-2.5
        rounded-xl
        font-medium
        cursor-pointer
        text-white
        bg-gradient-to-r
        from-blue-600
        to-cyan-500
        hover:from-blue-500
        hover:to-cyan-400
        disabled:opacity-50
        disabled:cursor-not-allowed
        transition-all
        duration-300
        shadow-lg
        shadow-blue-500/20
        hover:shadow-blue-500/40
      "
    >
      {loading ? "Generating..." : "Generate AI Summary"}
    </button>

    {summary && (
      <button
        onClick={() => {
          setSummary("");
          setError("");
        }}
        className="
          px-5 py-2.5
          rounded-xl
          bg-[#162238]
          border
          border-[#2a4064]
          text-white
          hover:bg-[#1d2d47]
          transition-all
          duration-300
        "
      >
        Clear
      </button>
    )}
  </div>

  {/* Content Area */}
  <div className="rounded-2xl border border-[#1a2c4a] bg-[#0d1728]/70 p-5 min-h-[160px]">
    {error ? (
      <div className="flex items-center gap-2 text-red-400">
        <span className="text-lg">⚠️</span>
        <p>{error}</p>
      </div>
    ) : (
      <p className="text-gray-300 leading-8 whitespace-pre-line">

{summary}
</p>
    )}
  </div>
</div>
  );
}