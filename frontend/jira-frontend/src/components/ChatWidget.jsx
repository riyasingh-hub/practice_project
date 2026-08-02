import { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { MessageCircle, Send, X } from "lucide-react";

const initialMessages = [
  {
    role: "assistant",
    text: "Hi! Ask me about project health, risks, backlog, or next actions."
  }
];

export default function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  const match = location.pathname.match(/^\/project\/([^/]+)/);
  const projectKey = match?.[1] || "";

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: message }
    ]);

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/chat",
        {
          message,
          projectKey,
          sessionId
        }
      );

      const answer = response.data?.answer || "No answer returned.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answer }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            error?.response?.data?.message ||
            "I could not answer this request right now."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="w-[360px] max-w-[calc(100vw-2rem)] h-[500px] rounded-2xl border border-[#1b2d4a] bg-[#081120] shadow-2xl shadow-blue-950/40 overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Jira AI Assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-white/15"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="h-[380px] overflow-y-auto p-4 space-y-3 bg-[#0c1729]">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-[#13223c] text-gray-100 border border-[#1d3250]"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm text-gray-300 bg-[#13223c] border border-[#1d3250]">
                Thinking...
              </div>
            )}
          </div>

          <div className="border-t border-[#1b2d4a] bg-[#081120] p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask a project question..."
              className="flex-1 rounded-xl border border-[#223355] bg-[#0c1729] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-3 py-2 text-white disabled:opacity-60"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-950/50 hover:scale-105 transition-transform"
          aria-label="Open chat assistant"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}
