import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { chatApi } from "../services/api";
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
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const handleSend = async (content) => {
        setShowSuggestions(false);
        const userMsg = {
            id: Date.now().toString(),
            role: "user",
            content,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);
        try {
            const res = await chatApi.publicChat(content, messages.map(m => ({ role: m.role, content: m.content })));
            const aiMsg = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: res.data?.data?.reply ||
                    res.data?.reply ||
                    res.data?.message ||
                    "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại sau.",
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        }
        catch {
            const errMsg = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại hoặc đăng nhập để được hỗ trợ tốt hơn.",
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errMsg]);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex flex-col", children: [_jsxs("header", { className: "flex items-center justify-between px-6 py-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-xl shadow-lg", children: "\uD83E\uDDB7" }), _jsxs("div", { children: [_jsx("p", { className: "font-display font-bold text-white text-base leading-tight", children: "Nha Khoa VinaMec" }), _jsx("p", { className: "text-emerald-300/70 text-xs", children: "Tr\u1EE3 l\u00FD Nha khoa AI" })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Link, { to: "/login", className: "px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition border border-white/20", children: "\u0110\u0103ng nh\u1EADp" }), _jsx(Link, { to: "/register", className: "px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition shadow-lg", children: "\u0110\u0103ng k\u00FD" })] })] }), _jsxs("div", { className: "flex-1 max-w-3xl w-full mx-auto px-4 py-4 flex flex-col", children: [_jsxs("div", { className: "mb-4 px-4 py-3 bg-emerald-900/50 backdrop-blur rounded-xl border border-emerald-700/50 text-sm text-emerald-100 flex items-center gap-2 shadow-inner", children: [_jsx("span", { children: "\u2139\uFE0F" }), _jsxs("span", { children: ["\u0110\u00E2y l\u00E0 chat c\u00F4ng khai \u2014 \u0110\u1EC3 \u0111\u01B0\u1EE3c t\u01B0 v\u1EA5n c\u00E1 nh\u00E2n h\u00F3a v\u00E0 s\u1EED d\u1EE5ng \u0111\u1EA7y \u0111\u1EE7 t\u00EDnh n\u0103ng, vui l\u00F2ng", " ", _jsx(Link, { to: "/login", className: "underline font-semibold text-emerald-300 hover:text-emerald-200", children: "\u0111\u0103ng nh\u1EADp" }), "."] })] }), _jsx("div", { className: "flex-1", style: { minHeight: "60vh" }, children: _jsx(ChatInterface, { messages: messages, onSend: handleSend, loading: loading, isPublic: true, title: "Tr\u1EE3 l\u00FD Nha khoa AI", showQuickReplies: showSuggestions, quickReplies: QUICK_REPLIES, onQuickReply: handleSend, aiName: "Tr\u1EE3 l\u00FD Nha khoa AI", aiAvatar: "\uD83E\uDDB7" }) })] })] }));
}
