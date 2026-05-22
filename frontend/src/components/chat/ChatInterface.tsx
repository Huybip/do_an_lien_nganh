import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import type { ChatMessage } from "../../types";

interface Props {
  messages: ChatMessage[];
  onSend: (msg: string) => Promise<void>;
  loading?: boolean;
  placeholder?: string;
  title?: string;
  isPublic?: boolean;
  showQuickReplies?: boolean;
  quickReplies?: string[];
  onQuickReply?: (text: string) => void;
  aiName?: string;
  aiAvatar?: string;
}

export default function ChatInterface({
  messages,
  onSend,
  loading,
  placeholder,
  title,
  isPublic,
  showQuickReplies,
  quickReplies,
  onQuickReply,
  aiName = "Dental AI Assistant",
  aiAvatar = "🤖",
}: Props) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    await onSend(msg);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isAIMessage = (msg: ChatMessage) => {
    return msg.role === "assistant" || msg.role === "ai";
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-emerald-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl shadow-lg">
          {aiAvatar}
        </div>
        <div>
          <h3 className="font-bold text-emerald-900 text-base">
            {title || aiName}
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-emerald-700 font-medium">
              Online • {isPublic ? "Chế độ công khai" : "Chế độ riêng tư"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-5xl mb-4 shadow-xl">
              {aiAvatar}
            </div>
            <p className="font-display font-bold text-lg text-emerald-900">
              Xin chào! Tôi là {aiName}
            </p>
            <p className="text-sm text-emerald-700 mt-1 max-w-xs leading-relaxed">
              Tôi có thể giúp bạn về sức khỏe răng miệng, các dịch vụ nha khoa, và tư vấn chăm sóc răng hàng ngày.
            </p>
            {showQuickReplies && quickReplies && quickReplies.length > 0 && (
              <div className="mt-5 w-full max-w-sm">
                <p className="text-xs text-emerald-500 font-medium mb-2">
                  Bạn có thể hỏi tôi:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickReplies.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => onQuickReply?.(q)}
                      className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition cursor-pointer shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
          >
            {isAIMessage(msg) && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs flex-shrink-0 mt-1 shadow-sm">
                {aiAvatar}
              </div>
            )}
            <div>
              <div
                className={
                  msg.role === "user"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-md shadow-md"
                    : "bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-2xl rounded-bl-sm px-4 py-3 max-w-md shadow-sm"
                }
                style={{ whiteSpace: "pre-line" }}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              <p
                className={`text-[10px] mt-1 ${msg.role === "user" ? "text-right text-emerald-400" : "text-emerald-400"}`}
              >
                {new Date(msg.timestamp || new Date().toISOString()).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs flex-shrink-0 mt-1 shadow-sm">
                👤
              </div>
            )}
          </div>
        ))}

        {/* Quick replies in chat stream */}
        {showQuickReplies && quickReplies && quickReplies.length > 0 && messages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onQuickReply?.(q)}
                className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition cursor-pointer shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs shadow-sm">
              {aiAvatar}
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
              <div
                className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-emerald-100 bg-emerald-50/50">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder || "Hỏi về sức khỏe răng miệng..."}
            rows={1}
            className="resize-none flex-1 min-h-[44px] max-h-32 overflow-y-auto bg-white border border-emerald-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-emerald-400 shadow-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 flex-shrink-0 transition-all shadow-md font-medium text-sm ${
              !input.trim() || loading
                ? "bg-emerald-200 text-emerald-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 active:scale-95"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
