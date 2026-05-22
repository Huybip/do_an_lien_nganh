import { useState } from "react";
import { Link } from "react-router-dom";
import { chatApi } from "../services/api";
import type { ChatMessage } from "../types";
import ChatInterface from "../components/chat/ChatInterface";

const QUICK_REPLIES = [
  "Tôi bị đau răng",
  "Cách đánh răng đúng cách?",
  "Giá niềng răng bao nhiêu?",
  "Khi nào nên khám răng?",
  "Răng nhạy cảm phải làm sao?",
  "Tẩy trắng răng giá bao nhiêu?",
  "Răng khôn có nên nhổ không?",
  "Hôi miệng làm sao?",
];

export default function PublicChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleSend = async (content: string) => {
    setShowSuggestions(false);
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await chatApi.publicChat(content, messages.map(m => ({ role: m.role, content: m.content })));
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          res.data?.data?.reply ||
          res.data?.reply ||
          res.data?.message ||
          "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại sau.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại hoặc đăng nhập để được hỗ trợ tốt hơn.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-xl shadow-lg">
            🦷
          </div>
          <div>
            <p className="font-display font-bold text-white text-base leading-tight">Nha Khoa VinaMec</p>
            <p className="text-emerald-300/70 text-xs">Trợ lý Nha khoa AI</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition border border-white/20"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition shadow-lg"
          >
            Đăng ký
          </Link>
        </div>
      </header>

      {/* Chat */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 flex flex-col">
        <div className="mb-4 px-4 py-3 bg-emerald-900/50 backdrop-blur rounded-xl border border-emerald-700/50 text-sm text-emerald-100 flex items-center gap-2 shadow-inner">
          <span>ℹ️</span>
          <span>
            Đây là chat công khai — Để được tư vấn cá nhân hóa và sử dụng đầy đủ tính năng, vui lòng{" "}
            <Link
              to="/login"
              className="underline font-semibold text-emerald-300 hover:text-emerald-200"
            >
              đăng nhập
            </Link>
            .
          </span>
        </div>
        <div className="flex-1" style={{ minHeight: "60vh" }}>
          <ChatInterface
            messages={messages}
            onSend={handleSend}
            loading={loading}
            isPublic
            title="Trợ lý Nha khoa AI"
            showQuickReplies={showSuggestions}
            quickReplies={QUICK_REPLIES}
            onQuickReply={handleSend}
            aiName="Trợ lý Nha khoa AI"
            aiAvatar="🦷"
          />
        </div>
      </div>
    </div>
  );
}
