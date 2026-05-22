import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import PatientSidebar from "../../components/layout/PatientSidebar";
import ChatMessage, {} from "../../components/chat/ChatMessage";
import ConversationList from "../../components/chat/ConversationList";
import { conversationApi, imageApi, appointmentApi, chatApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
const QUICK_REPLIES = [
    "Tôi bị đau răng", "Cách chăm sóc răng miệng đúng cách?",
    "Giá dịch vụ niềng răng là bao nhiêu?", "Khi nào nên khám răng định kỳ?",
    "Răng nhạy cảm phải làm sao?", "Tôi muốn đặt lịch khám",
    "Răng khôn có nên nhổ không?", "Tẩy trắng răng giá bao nhiêu?",
];
const SESSION_KEY = "vinamec_patient_chatbot_session";
const HISTORY_KEY = "vinamec_patient_chatbot_history";
export default function PatientChat() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isChatbot, setIsChatbot] = useState(false);
    const [chatbotHistory, setChatbotHistory] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [welcomeShown, setWelcomeShown] = useState(false);
    const isInitializedRef = useRef(false);
    useEffect(() => {
        checkTodayAppointments();
    }, [toast]);
    useEffect(() => {
        if (!isChatbot)
            return;
        if (isInitializedRef.current)
            return;
        isInitializedRef.current = true;
        const savedSessionId = localStorage.getItem(SESSION_KEY);
        const savedHistory = localStorage.getItem(HISTORY_KEY);
        if (savedSessionId)
            setSessionId(savedSessionId);
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                if (parsed.length > 0) {
                    setChatbotHistory(parsed);
                    setMessages(parsed.map((h) => ({
                        id: h.id || `msg-${Date.now()}-${Math.random()}`,
                        sender: {
                            id: h.role === "user" ? (user?._id || user?.id || "unknown") : "ai-assistant",
                            name: h.role === "user" ? (user?.name || "Bạn") : "Trợ lý Nha khoa AI",
                        },
                        type: "text",
                        content: h.content,
                        timestamp: h.timestamp || new Date().toISOString(),
                        isOwn: h.role === "user",
                    })));
                }
                else {
                    showWelcomeMessage();
                }
            }
            catch {
                showWelcomeMessage();
            }
        }
        else {
            showWelcomeMessage();
        }
    }, [isChatbot]);
    const showWelcomeMessage = () => {
        if (welcomeShown)
            return;
        setWelcomeShown(true);
        setShowSuggestions(true);
        setMessages([{
                id: `welcome-${Date.now()}`,
                sender: { id: "ai-assistant", name: "Trợ lý Nha khoa AI" },
                type: "text",
                content: "Xin chào! 👋 Chào mừng bạn đến với Nha Khoa VinaMec!\n\nTôi là trợ lý nha khoa AI, có thể giúp bạn:\n\n• Tư vấn về sức khỏe răng miệng\n• Giải đáp thắc mắc về các dịch vụ nha khoa\n• Tìm hiểu về chi phí điều trị\n• Hướng dẫn chăm sóc răng miệng hàng ngày\n\nBạn cần tôi hỗ trợ gì hôm nay? 😊",
                timestamp: new Date().toISOString(),
                isOwn: false,
            }]);
    };
    const checkTodayAppointments = async () => {
        try {
            const res = await appointmentApi.getMine();
            const appointments = res.data?.data || [];
            const today = new Date().toISOString().split("T")[0];
            const todayAppts = appointments.filter((apt) => apt.date === today);
            if (todayAppts.length > 0) {
                const list = todayAppts.map((apt) => `${apt.doctorName} - ${apt.time}`).join(", ");
                toast.info(`Hôm nay bạn có ${todayAppts.length} lịch khám: ${list}`, 5000);
            }
        }
        catch { /* ignore */ }
    };
    const handleSelectConversation = async (conversationId, otherUser) => {
        setSelectedConversation(conversationId);
        setSelectedUser(otherUser);
        setIsChatbot(false);
        setShowSuggestions(false);
        isInitializedRef.current = false;
        await loadConversationMessages(conversationId);
    };
    const handleSelectChatbot = () => {
        setSelectedConversation("chatbot");
        setSelectedUser(null);
        setIsChatbot(true);
        setShowSuggestions(true);
        isInitializedRef.current = false;
        setWelcomeShown(false);
    };
    const loadConversationMessages = async (conversationId) => {
        try {
            setLoading(true);
            const res = await conversationApi.getById(conversationId);
            const data = res.data?.data;
            const rawMessages = data?.messages || [];
            const formattedMessages = rawMessages.map((msg, idx) => ({
                id: msg._id || `${idx}-${Date.now()}`,
                sender: {
                    id: msg.sender?._id || msg.sender?.id || msg.sender,
                    name: msg.sender?.name || "Unknown",
                    avatar: msg.sender?.avatar,
                },
                type: (msg.type || "text"),
                content: msg.content,
                imageUrl: msg.imageUrl,
                audioUrl: msg.audioUrl,
                timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
                isOwn: msg.sender?._id?.toString() === user?._id?.toString() ||
                    msg.sender?.toString() === user?._id?.toString() ||
                    msg.sender === user?._id,
                role: "user",
            }));
            setMessages(formattedMessages);
        }
        catch {
            toast.error("Không thể tải tin nhắn");
        }
        finally {
            setLoading(false);
        }
    };
    const handleSendText = async (content) => {
        if (!selectedConversation || !user)
            return;
        if (isChatbot) {
            setShowSuggestions(false);
            const userMsg = {
                id: Date.now().toString(),
                sender: { id: user._id || user.id || "unknown", name: user.name || "Bạn", avatar: user.avatar },
                type: "text", content,
                timestamp: new Date().toISOString(), isOwn: true,
            };
            setMessages((prev) => [...prev, userMsg]);
            const newHistory = [...chatbotHistory, {
                    id: Date.now().toString(), role: "user", content,
                    timestamp: new Date().toISOString(),
                }];
            setChatbotHistory(newHistory);
            localStorage.setItem(SESSION_KEY, sessionId || "");
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            try {
                setLoading(true);
                const res = await chatApi.privateChat(content, newHistory.map((h) => ({ role: h.role, content: h.content })), sessionId || undefined);
                const aiResponse = res.data?.data?.reply || res.data?.reply ||
                    "Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại.";
                const aiMsg = {
                    id: (Date.now() + 1).toString(),
                    sender: { id: "ai-assistant", name: "Trợ lý Nha khoa AI" },
                    type: "text", content: aiResponse,
                    timestamp: new Date().toISOString(), isOwn: false,
                };
                setMessages((prev) => [...prev, aiMsg]);
                const finalHistory = [...newHistory, {
                        id: (Date.now() + 1).toString(), role: "assistant",
                        content: aiResponse, timestamp: new Date().toISOString(),
                    }];
                setChatbotHistory(finalHistory);
                localStorage.setItem(HISTORY_KEY, JSON.stringify(finalHistory));
                const newSessionId = res.data?.data?.sessionId || res.data?.sessionId;
                if (newSessionId) {
                    setSessionId(newSessionId);
                    localStorage.setItem(SESSION_KEY, newSessionId);
                }
            }
            catch {
                toast.error("Lỗi giao tiếp với AI. Vui lòng thử lại.");
                setMessages((prev) => prev.slice(0, -1));
                setChatbotHistory((prev) => prev.slice(0, -1));
            }
            finally {
                setLoading(false);
            }
        }
        else {
            const userMsg = {
                id: Date.now().toString(),
                sender: { id: user._id || user.id || "unknown", name: user.name || "Bạn", avatar: user.avatar },
                type: "text", content,
                timestamp: new Date().toISOString(), isOwn: true,
            };
            setMessages((prev) => [...prev, userMsg]);
            try {
                await conversationApi.sendMessage(selectedConversation, { content, type: "text" });
            }
            catch {
                toast.error("Không thể gửi tin nhắn");
            }
        }
    };
    const handleSendImage = async (file) => {
        if (!selectedConversation || !user)
            return;
        if (isChatbot) {
            toast.info("Gửi hình ảnh không hỗ trợ cho AI chatbot");
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("image", file);
            const res = await imageApi.upload(formData);
            const imageUrl = res.data?.data?.url || res.data?.url;
            if (!imageUrl)
                throw new Error("No URL");
            const userMsg = {
                id: Date.now().toString(),
                sender: { id: user._id || user.id || "unknown", name: user.name || "Bạn", avatar: user.avatar },
                type: "image", imageUrl,
                timestamp: new Date().toISOString(), isOwn: true,
            };
            setMessages((prev) => [...prev, userMsg]);
            await conversationApi.sendMessage(selectedConversation, { content: "Hình ảnh", type: "image", imageUrl });
            toast.success("Đã gửi hình ảnh");
        }
        catch {
            toast.error("Không thể gửi hình ảnh");
        }
        finally {
            setLoading(false);
        }
    };
    const handleSendAudio = async (file) => {
        if (!selectedConversation || !user)
            return;
        if (isChatbot) {
            toast.info("Gửi tin nhắn thoại không hỗ trợ cho AI chatbot");
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("audio", file);
            const res = await imageApi.upload(formData);
            const audioUrl = res.data?.data?.url || res.data?.url;
            if (!audioUrl)
                throw new Error("No URL");
            const userMsg = {
                id: Date.now().toString(),
                sender: { id: user._id || user.id || "unknown", name: user.name || "Bạn", avatar: user.avatar },
                type: "audio", audioUrl, audioName: file.name,
                timestamp: new Date().toISOString(), isOwn: true,
            };
            setMessages((prev) => [...prev, userMsg]);
            await conversationApi.sendMessage(selectedConversation, { content: "Tin nhắn thoại", type: "audio", audioUrl });
            toast.success("Đã gửi tin nhắn thoại");
        }
        catch {
            toast.error("Không thể gửi tin nhắn thoại");
        }
        finally {
            setLoading(false);
        }
    };
    const handleQuickReply = async (text) => {
        setShowSuggestions(false);
        await handleSendText(text);
    };
    const handleClearHistory = async () => {
        if (!window.confirm("Bạn có chắc muốn xóa lịch sử chat với AI?"))
            return;
        if (sessionId) {
            try {
                await chatApi.deleteSession(sessionId);
            }
            catch { /* ignore */ }
        }
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(HISTORY_KEY);
        setSessionId(null);
        setChatbotHistory([]);
        setMessages([]);
        setWelcomeShown(false);
        showWelcomeMessage();
        toast.success("Đã xóa lịch sử chat");
    };
    return (_jsxs("div", { className: "flex", children: [_jsx(PatientSidebar, {}), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between border-b border-slate-200/60", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-800", children: "Tin nh\u1EAFn" }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Tr\u00F2 chuy\u1EC7n v\u1EDBi AI ho\u1EB7c b\u00E1c s\u0129" })] }), isChatbot && messages.length > 0 && (_jsxs("button", { onClick: handleClearHistory, className: "flex items-center gap-2 text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-xl hover:bg-red-50 transition", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }), "X\u00F3a l\u1ECBch s\u1EED"] }))] }), _jsxs("div", { className: "h-[calc(100vh-65px)] flex gap-0 lg:gap-4 p-4 lg:p-6", children: [_jsx("div", { className: "w-[260px] lg:w-80 flex-shrink-0", children: _jsx(ConversationList, { onSelectConversation: handleSelectConversation, onSelectChatbot: handleSelectChatbot, loading: loading, isChatbotSelected: isChatbot }) }), _jsx("div", { className: "flex-1 min-w-0", children: isChatbot ? (_jsx("div", { className: "h-full animate-fade-in", children: _jsx(ChatMessage, { messages: messages, onSendText: handleSendText, onSendImage: handleSendImage, onSendAudio: handleSendAudio, loading: loading, title: "Tr\u1EE3 l\u00FD Nha khoa AI", placeholder: "H\u1ECFi t\u00F4i v\u1EC1 s\u1EE9c kh\u1ECFe r\u0103ng mi\u1EC7ng...", showQuickReplies: showSuggestions, quickReplies: QUICK_REPLIES, onQuickReply: handleQuickReply, aiName: "Tr\u1EE3 l\u00FD Nha khoa AI", aiAvatar: "\uD83E\uDD16" }) })) : selectedConversation && selectedUser ? (_jsx("div", { className: "h-full animate-fade-in", children: _jsx(ChatMessage, { messages: messages, onSendText: handleSendText, onSendImage: handleSendImage, onSendAudio: handleSendAudio, loading: loading, title: `Chat với ${selectedUser.name || "Bác sĩ"}`, placeholder: "Nh\u1EADp tin nh\u1EAFn..." }) })) : (_jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 animate-fade-in", style: { boxShadow: "0 1px 3px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.06)" }, children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4", children: _jsx("svg", { className: "w-8 h-8 text-emerald-500", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }) }), _jsx("p", { className: "font-bold text-slate-700 text-base mb-2", children: "Ch\u1ECDn m\u1ED9t cu\u1ED9c tr\u00F2 chuy\u1EC7n" }), _jsx("p", { className: "text-sm text-slate-400 text-center max-w-xs", children: "Ch\u1ECDn m\u1ED9t b\u00E1c s\u0129 t\u1EEB danh s\u00E1ch ho\u1EB7c chat v\u1EDBi tr\u1EE3 l\u00FD AI" })] })) })] })] })] }));
}
