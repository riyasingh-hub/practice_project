import { useEffect, useState } from "react";
 
export default function AISummary() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchAISummary = async () => {
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
 
        setSummary(
          data.aiSummary || "No AI summary available."
        );
      } catch (error) {
        console.error("AI Summary Error:", error);
        setSummary("Failed to load AI summary.");
      } finally {
        setLoading(false);
      }
    };
 
    fetchAISummary();
  }, []);
 
  return (
    <div className="bg-[#081120] p-6 rounded-xl border border-[#16243d]">
      <h2 className="text-xl mb-4">
        AI Summary
      </h2>
 
      <p className="text-gray-300 leading-8 whitespace-pre-line">
        {loading
          ? "Generating AI Summary..."
          : summary}
      </p>
    </div>
  );
}