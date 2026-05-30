import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";

export default function CineAssistant({ currentMovie }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm CineAssistant 🎬 Ask me for recommendations, movie facts, or anything about film.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].filter((m) => m.role !== "system"),
          currentMovie: currentMovie
            ? {
                title: currentMovie.title,
                year: currentMovie.release_date?.substring(0, 4),
                genres: currentMovie.genres?.map((g) => g.name).join(", "),
                overview: currentMovie.overview?.substring(0, 200),
              }
            : null,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || "Something went wrong." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatMsg = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="text-white font-semibold">
          {part}
        </strong>
      ) : (
        part
      ),
    );
  };

  const quickPrompts = currentMovie
    ? [
        `Why watch ${currentMovie.title}?`,
        "Similar movies?",
        "Who directed this?",
      ]
    : ["Recommend a thriller", "Best films of 2024", "Hidden gem comedies"];

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-medium text-sm shadow-lg transition-all duration-150"
        style={{
          backgroundColor: open ? "#1F2937" : "#2563EB",
          color: "white",
          border: "1px solid",
          borderColor: open ? "#374151" : "#1D4ED8",
          boxShadow: "0 4px 24px rgba(37,99,235,0.3)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {open ? <X size={16} /> : <Sparkles size={16} />}
        <span>{open ? "Close" : "CineAssistant"}</span>
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: "360px",
            height: "500px",
            backgroundColor: "#0F0F0F",
            border: "1px solid #2A2A2A",
            boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              borderBottom: "1px solid #1F1F1F",
              backgroundColor: "#141414",
            }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{
                backgroundColor: "rgba(37,99,235,0.15)",
                border: "1px solid rgba(37,99,235,0.3)",
              }}
            >
              <Bot size={15} color="#2563EB" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">CineAssistant</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>
                AI Movie Expert
              </p>
            </div>
            <div
              className="ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "#22C55E",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor: "#22C55E",
                  display: "inline-block",
                }}
              />
              Online
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#2A2A2A transparent",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed"
                  style={{
                    backgroundColor:
                      msg.role === "user" ? "#2563EB" : "#1A1A1A",
                    color: msg.role === "user" ? "white" : "#D1D5DB",
                    border:
                      msg.role === "assistant" ? "1px solid #2A2A2A" : "none",
                  }}
                >
                  {msg.role === "assistant"
                    ? formatMsg(msg.content)
                    : msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="px-3 py-2 rounded-xl text-sm"
                  style={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2A2A2A",
                    color: "#6B7280",
                  }}
                >
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div
            className="px-4 pb-2 flex gap-2 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => setInput(p)}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-100"
                style={{
                  backgroundColor: "rgba(37,99,235,0.1)",
                  border: "1px solid rgba(37,99,235,0.2)",
                  color: "#60A5FA",
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3"
            style={{
              borderTop: "1px solid #1F1F1F",
              backgroundColor: "#141414",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything about movies…"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-100"
              style={{
                backgroundColor:
                  input.trim() && !loading ? "#2563EB" : "#1F1F1F",
                color: input.trim() && !loading ? "white" : "#4B5563",
              }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
