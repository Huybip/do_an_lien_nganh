import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
export default function ChatMessage({ messages, onSendText, onSendImage, onSendAudio, loading, placeholder, title, showQuickReplies, quickReplies, onQuickReply, aiName = "AI Assistant", aiAvatar = "🤖", }) {
    const { toast } = useToast();
    const [input, setInput] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const endRef = useRef(null);
    const fileInputRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const mediaRecorderRef = useRef(null);
    const timerRef = useRef(null);
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, showQuickReplies]);
    const handleSendText = async () => {
        if (!input.trim() || loading)
            return;
        const msg = input.trim();
        setInput("");
        await onSendText(msg);
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendText();
        }
    };
    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file hình ảnh hợp lệ");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Hình ảnh phải nhỏ hơn 5MB");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result);
        reader.readAsDataURL(file);
        try {
            await onSendImage(file);
            setImagePreview(null);
            if (fileInputRef.current)
                fileInputRef.current.value = "";
        }
        catch {
            toast.error("Tải lên hình ảnh thất bại");
        }
    };
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            recordedChunksRef.current = [];
            mediaRecorder.ondataavailable = (e) => recordedChunksRef.current.push(e.data);
            mediaRecorder.onstop = async () => {
                const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
                const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
                try {
                    await onSendAudio(file);
                }
                catch {
                    toast.error("Gửi tin nhắn thoại thất bại");
                }
                recordedChunksRef.current = [];
            };
            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
        }
        catch {
            toast.error("Không thể truy cập microphone");
        }
    };
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
            setIsRecording(false);
            if (timerRef.current)
                clearInterval(timerRef.current);
            setRecordingTime(0);
        }
    };
    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    const isAIMessage = (msg) => msg.sender.id === "ai-assistant" || msg.sender.name.includes("AI") || msg.sender.name.includes("Trợ");
    return (_jsxs("div", { className: "flex flex-col h-full bg-white rounded-2xl overflow-hidden", style: { boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)" }, children: [_jsxs("div", { className: "flex items-center gap-3 px-5 py-4", style: {
                    background: "linear-gradient(135deg, #0c4a6e 0%, #0f766e 100%)",
                    boxShadow: "0 2px 8px rgba(15,118,110,0.2)",
                }, children: [_jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl shadow-md flex-shrink-0", style: { background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)" }, children: aiAvatar }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-black text-white text-base", children: title || aiName }), _jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" }), _jsx("span", { className: "text-xs font-medium text-teal-100", children: "Online" })] })] })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50", children: [messages.length === 0 && (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center py-12", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl mb-4 shadow-lg", style: { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 8px 24px rgba(14,165,233,0.3)" }, children: aiAvatar }), _jsx("p", { className: "font-black text-slate-800 text-base", children: "B\u1EAFt \u0111\u1EA7u cu\u1ED9c tr\u00F2 chuy\u1EC7n" }), _jsx("p", { className: "text-sm text-slate-400 mt-2 max-w-xs", children: "H\u00E3y \u0111\u1EB7t c\u00E2u h\u1ECFi v\u1EC1 s\u1EE9c kh\u1ECFe r\u0103ng mi\u1EC7ng ho\u1EB7c ch\u1ECDn g\u1EE3i \u00FD b\u00EAn d\u01B0\u1EDBi" })] })), messages.map((msg) => (_jsxs("div", { className: `flex gap-3 ${msg.isOwn ? "flex-row-reverse" : "flex-row"}`, children: [_jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 overflow-hidden", style: {
                                    background: isAIMessage(msg)
                                        ? "linear-gradient(135deg, #0ea5e9, #14b8a6)"
                                        : "linear-gradient(135deg, #6366f1, #4f46e5)",
                                    boxShadow: isAIMessage(msg) ? "0 2px 8px rgba(14,165,233,0.3)" : "0 2px 8px rgba(99,102,241,0.3)",
                                }, children: isAIMessage(msg) ? aiAvatar : msg.sender.avatar ? (_jsx("img", { src: msg.sender.avatar, alt: msg.sender.name, className: "w-full h-full object-cover" })) : (msg.sender.name.charAt(0).toUpperCase()) }), _jsxs("div", { className: `flex flex-col max-w-xs ${msg.isOwn ? "items-end" : "items-start"}`, children: [_jsx("p", { className: "text-[11px] font-bold mb-1", style: { color: msg.isOwn ? "#0ea5e9" : "#14b8a6" }, children: isAIMessage(msg) ? aiName : msg.sender.name }), _jsxs("div", { className: `rounded-2xl px-4 py-3 ${msg.isOwn
                                            ? "text-white rounded-br-sm"
                                            : "bg-white text-slate-700 rounded-bl-sm border border-slate-100"}`, style: msg.isOwn ? { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 2px 8px rgba(14,165,233,0.25)" } : {}, children: [msg.type === "text" && _jsx("p", { className: "text-sm leading-relaxed break-words whitespace-pre-line", children: msg.content }), msg.type === "image" && msg.imageUrl && (_jsx("img", { src: msg.imageUrl, alt: "Shared", className: "rounded-xl max-w-full", onError: (e) => { e.target.style.display = "none"; } })), msg.type === "audio" && msg.audioUrl && (_jsx("div", { className: "flex items-center gap-2", children: _jsx("audio", { controls: true, className: "h-6 w-48", src: msg.audioUrl }) }))] }), _jsx("p", { className: "text-[10px] text-slate-400 mt-1", children: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })] })] }, msg.id))), showQuickReplies && quickReplies && quickReplies.length > 0 && (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("p", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1", children: "G\u1EE3i \u00FD:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: quickReplies.map((reply, idx) => (_jsx("button", { onClick: () => onQuickReply?.(reply), className: "text-xs bg-white border-2 border-teal-100 text-teal-700 px-3 py-2 rounded-xl hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 cursor-pointer font-semibold shadow-sm hover:shadow-md", children: reply }, idx))) })] })), loading && (_jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0", style: { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" }, children: aiAvatar }), _jsx("div", { className: "bg-white rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 border border-slate-100 shadow-sm", children: [0, 150, 300].map((d) => (_jsx("div", { className: "w-2 h-2 rounded-full", style: { background: "#0ea5e9", animation: `bounce 1s ${d}ms infinite` } }, d))) })] })), _jsx("div", { ref: endRef })] }), imagePreview && (_jsxs("div", { className: "px-4 py-3 border-t border-slate-100 bg-white flex items-center gap-3", children: [_jsx("img", { src: imagePreview, alt: "preview", className: "h-12 w-12 object-cover rounded-lg" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs font-semibold text-slate-600", children: "S\u1EB5n s\u00E0ng g\u1EEDi h\u00ECnh \u1EA3nh" }), _jsx("p", { className: "text-[11px] text-slate-400", children: "Nh\u1EA5n g\u1EEDi \u0111\u1EC3 chia s\u1EBB" })] }), _jsx("button", { onClick: () => setImagePreview(null), className: "w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M6 18L18 6M6 6l12 12" }) }) })] })), isRecording && (_jsxs("div", { className: "px-4 py-3 border-t border-red-100 bg-red-50 flex items-center gap-3", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-red-500 animate-pulse" }), _jsxs("span", { className: "text-sm font-semibold text-red-600", children: ["\u0110ang ghi \u00E2m... ", formatTime(recordingTime)] })] })), _jsx("div", { className: "px-4 py-3 border-t border-slate-100 bg-white", children: _jsxs("div", { className: "flex gap-2 items-end rounded-2xl px-3 py-2 border-2 transition-all duration-200", style: { borderColor: "#e2e8f0", background: "#f8fafc" }, onFocus: (e) => { e.currentTarget.style.borderColor = "#14b8a6"; e.currentTarget.style.background = "white"; }, onBlur: (e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }, children: [_jsx("button", { onClick: () => fileInputRef.current?.click(), className: "flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-200 transition flex-shrink-0 text-teal-600", title: "G\u1EEDi h\u00ECnh \u1EA3nh", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleImageSelect, className: "hidden" }), _jsx("textarea", { value: input, onChange: (e) => setInput(e.target.value), onKeyDown: handleKeyDown, placeholder: placeholder || "Nhắn tin...", rows: 1, className: "resize-none flex-1 min-h-[36px] max-h-24 overflow-y-auto bg-transparent text-sm text-slate-700 focus:outline-none placeholder-slate-400 py-1" }), _jsx("button", { onMouseDown: startRecording, onMouseUp: stopRecording, onTouchStart: startRecording, onTouchEnd: stopRecording, className: `flex items-center justify-center w-9 h-9 rounded-full transition flex-shrink-0 ${isRecording ? "bg-red-500 text-white animate-pulse" : "hover:bg-slate-200 text-teal-600"}`, title: "Gi\u1EEF \u0111\u1EC3 ghi \u00E2m", children: _jsxs("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M12 1a4 4 0 00-4 4v6a4 4 0 008 0V5a4 4 0 00-4-4z" }), _jsx("path", { d: "M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.93V20H9a1 1 0 000 2h6a1 1 0 000-2h-2v-2.07A7 7 0 0019 11z" })] }) }), _jsx("button", { onClick: async () => {
                                if (imagePreview && fileInputRef.current?.files?.[0]) {
                                    await onSendImage(fileInputRef.current.files[0]);
                                    setImagePreview(null);
                                    fileInputRef.current.value = "";
                                }
                                else {
                                    await handleSendText();
                                }
                            }, disabled: (!input.trim() && !imagePreview) || loading, className: `flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 flex-shrink-0 shadow-sm ${(!input.trim() && !imagePreview) || loading
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "text-white hover:shadow-md active:scale-95"}`, style: (!input.trim() && !imagePreview) || loading ? {} : { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }, children: _jsx("svg", { className: "w-5 h-5 -rotate-45", fill: "none", stroke: "currentColor", strokeWidth: 2.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) }) })] }) })] }));
}
