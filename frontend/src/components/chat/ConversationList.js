import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { conversationApi } from "../../services/api";
import { useToast } from "../../hooks/useToast";
export default function ConversationList({ onSelectConversation, onSelectChatbot, isChatbotSelected, }) {
    const { toast } = useToast();
    const [conversations, setConversations] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [showUserList, setShowUserList] = useState(false);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    useEffect(() => { loadConversations(); }, []);
    const loadConversations = async () => {
        setLoadingConversations(true);
        try {
            const res = await conversationApi.getAll();
            setConversations(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
        }
        catch (error) {
            toast.error("Không thể tải cuộc trò chuyện");
        }
        finally {
            setLoadingConversations(false);
        }
    };
    const loadAvailableUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await conversationApi.getAvailableUsers();
            const users = res.data?.data || res.data || [];
            setAvailableUsers(Array.isArray(users) ? users : []);
            setShowUserList(true);
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách người dùng");
        }
        finally {
            setLoadingUsers(false);
        }
    };
    const handleSelectUser = async (user) => {
        try {
            const res = await conversationApi.findOrCreate(user._id || user.id || "");
            const conversation = res.data?.data;
            if (conversation) {
                onSelectConversation(conversation.conversationId || conversation.id, user);
                setShowUserList(false);
                setSearchTerm("");
                loadConversations();
            }
        }
        catch {
            toast.error("Không thể bắt đầu cuộc trò chuyện");
        }
    };
    const filteredUsers = availableUsers.filter((user) => user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    return (_jsxs("div", { className: "flex flex-col h-full bg-white rounded-2xl border border-slate-100 overflow-hidden", style: { boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)" }, children: [_jsxs("div", { className: "px-4 py-4 border-b border-slate-100", style: { background: "linear-gradient(135deg, #0c4a6e 0%, #0f766e 100%)" }, children: [_jsx("h3", { className: "font-black text-white text-base mb-3", children: "Tin nh\u1EAFn" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: onSelectChatbot, className: `flex-1 text-sm py-2 px-3 rounded-xl transition-all font-semibold ${isChatbotSelected
                                    ? "text-white shadow-md"
                                    : "text-teal-100/80 hover:text-white hover:bg-white/10"}`, style: isChatbotSelected ? { background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" } : {}, children: "\uD83E\uDD16 AI Chat" }), _jsx("button", { onClick: loadAvailableUsers, className: "flex-1 text-sm py-2 px-3 rounded-xl transition font-semibold text-teal-800 bg-white/90 hover:bg-white", style: { boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }, children: loadingUsers ? "..." : "+ Mới" })] })] }), showUserList && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", style: { background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }, children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden", style: { animation: "slideUp 0.3s ease" }, children: [_jsxs("div", { className: "px-5 py-4 border-b border-slate-100 flex items-center justify-between", children: [_jsx("h4", { className: "font-black text-slate-800 text-base", children: "Ch\u1ECDn ng\u01B0\u1EDDi tr\u00F2 chuy\u1EC7n" }), _jsx("button", { onClick: () => setShowUserList(false), className: "w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("div", { className: "px-5 py-3 border-b border-slate-100", children: _jsx("input", { type: "text", placeholder: "T\u00ECm theo t\u00EAn ho\u1EB7c email...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition" }) }), _jsx("div", { className: "flex-1 overflow-y-auto p-3 space-y-1 max-h-72", children: filteredUsers.length > 0 ? filteredUsers.map((user) => (_jsxs("button", { onClick: () => handleSelectUser(user), className: "w-full text-left p-3 rounded-xl hover:bg-slate-50 transition flex items-center gap-3 group", children: [_jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0", style: { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 2px 8px rgba(14,165,233,0.3)" }, children: user.avatar ? (_jsx("img", { src: user.avatar, alt: user.name, className: "w-full h-full rounded-full object-cover" })) : (user.name?.charAt(0).toUpperCase()) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-bold text-sm text-slate-800", children: user.name }), _jsx("p", { className: "text-xs text-slate-400 truncate", children: user.email })] }), _jsx("svg", { className: "w-5 h-5 text-slate-300 group-hover:text-teal-500 transition flex-shrink-0", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 5l7 7-7 7" }) })] }, user._id || user.id))) : (_jsx("div", { className: "text-center py-10 px-4", children: _jsx("p", { className: "text-sm text-slate-400", children: loadingUsers ? "Đang tải..." : "Không tìm thấy người dùng" }) })) })] }) })), _jsx("div", { className: "flex-1 overflow-y-auto", children: loadingConversations ? (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-8 h-8 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-2" }), _jsx("p", { className: "text-xs text-slate-400", children: "\u0110ang t\u1EA3i..." })] }) })) : conversations.length > 0 ? (_jsx("div", { className: "p-2 space-y-0.5", children: conversations.map((conv) => (_jsx("button", { onClick: () => onSelectConversation(conv.conversationId || conv.id, conv.otherUser), className: "w-full text-left p-3 rounded-xl hover:bg-slate-50 transition group", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0", style: { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 2px 8px rgba(14,165,233,0.3)" }, children: conv.otherUser.avatar ? (_jsx("img", { src: conv.otherUser.avatar, alt: conv.otherUser.name, className: "w-full h-full rounded-full object-cover" })) : (conv.otherUser.name?.charAt(0).toUpperCase()) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "font-bold text-sm text-slate-800 truncate", children: conv.otherUser.name }), conv.lastMessage?.timestamp && (_jsx("span", { className: "text-[10px] text-slate-400 flex-shrink-0", children: new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }))] }), _jsx("p", { className: "text-xs text-slate-400 truncate mt-0.5", children: conv.lastMessage?.content || "Chưa có tin nhắn" })] })] }) }, conv.conversationId))) })) : (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center py-12 px-4", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl flex items-center justify-center mb-4", style: { background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)" }, children: _jsx("svg", { className: "w-7 h-7", style: { color: "#14b8a6" }, fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }) }), _jsx("p", { className: "font-bold text-slate-700 text-sm mb-1", children: "Ch\u01B0a c\u00F3 cu\u1ED9c tr\u00F2 chuy\u1EC7n" }), _jsx("p", { className: "text-xs text-slate-400 mb-4", children: "B\u1EAFt \u0111\u1EA7u tr\u00F2 chuy\u1EC7n v\u1EDBi AI ho\u1EB7c b\u00E1c s\u0129" }), _jsx("button", { onClick: loadAvailableUsers, className: "text-sm font-semibold px-4 py-2 rounded-xl text-white transition hover:-translate-y-0.5", style: { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }, children: "B\u1EAFt \u0111\u1EA7u chat" })] })) })] }));
}
