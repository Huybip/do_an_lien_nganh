import { useState, useEffect, useRef } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import ChatMessage, { type Message } from "../../components/chat/ChatMessage";
import ConversationList from "../../components/chat/ConversationList";
import {
  conversationApi,
  imageApi,
  appointmentApi,
  chatApi,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import type { User, Appointment, ChatMessage as ChatMsg } from "../../types";

const QUICK_REPLIES = {
  greeting: [
    "Tôi bị đau răng",
    "Cách chăm sóc răng miệng đúng cách?",
    "Giá dịch vụ niềng răng là bao nhiêu?",
    "Khi nào nên khám răng định kỳ?",
    "Răng nhạy cảm phải làm sao?",
  ],
};

const SESSION_KEY = "vinamec_doctor_chatbot_session";
const HISTORY_KEY = "vinamec_doctor_chatbot_history";

export default function DoctorChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isChatbot, setIsChatbot] = useState(false);
  const [chatbotHistory, setChatbotHistory] = useState<ChatMsg[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [welcomeShown, setWelcomeShown] = useState(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    checkTodayAppointments();
  }, [toast]);

  useEffect(() => {
    if (!isChatbot) return;
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const savedSessionId = localStorage.getItem(SESSION_KEY);
    const savedHistory = localStorage.getItem(HISTORY_KEY);

    if (savedSessionId) {
      setSessionId(savedSessionId);
    }

    if (savedHistory) {
      try {
        const parsed: ChatMsg[] = JSON.parse(savedHistory);
        if (parsed.length > 0) {
          setChatbotHistory(parsed);
          const formatted: Message[] = parsed.map((h) => ({
            id: h.id || `msg-${Date.now()}-${Math.random()}`,
            sender: {
              id: h.role === "user" ? (user?._id || user?.id || "unknown") : "ai-assistant",
              name: h.role === "user" ? (user?.name || "You") : "Trợ lý Nha khoa AI",
            },
            type: "text" as const,
            content: h.content,
            timestamp: h.timestamp || new Date().toISOString(),
            isOwn: h.role === "user",
          }));
          setMessages(formatted);
        } else {
          showWelcomeMessage();
        }
      } catch {
        showWelcomeMessage();
      }
    } else {
      showWelcomeMessage();
    }
  }, [isChatbot]);

  const showWelcomeMessage = () => {
    if (welcomeShown) return;
    setWelcomeShown(true);
    setShowSuggestions(true);
    const welcome: Message = {
      id: `welcome-${Date.now()}`,
      sender: {
        id: "ai-assistant",
        name: "Trợ lý Nha khoa AI",
      },
      type: "text",
      content:
        "Xin chào Bác sĩ! Tôi là trợ lý nha khoa AI của Nha Khoa VinaMec. Tôi có thể hỗ trợ bạn:\n\n" +
        "• Tư vấn lâm sàng về các ca bệnh\n" +
        "• Tra cứu thông tin dịch vụ nha khoa\n" +
        "• Hướng dẫn chăm sóc răng miệng cho bệnh nhân\n" +
        "• Giải đáp thắc mắc về điều trị\n\n" +
        "Bạn cần tôi giúp gì hôm nay?",
      timestamp: new Date().toISOString(),
      isOwn: false,
    };
    setMessages([welcome]);
  };

  const checkTodayAppointments = async () => {
    try {
      const res = await appointmentApi.getAll();
      const appointments: Appointment[] = res.data?.data || [];
      const today = new Date().toISOString().split("T")[0];

      const todayAppointments = appointments.filter(
        (apt) => apt.date === today,
      );

      if (todayAppointments.length > 0) {
        const appointmentsList = todayAppointments
          .map((apt) => `${apt.patientName} - ${apt.time}`)
          .join(", ");
        toast.info(
          `Hôm nay bạn có ${todayAppointments.length} lịch khám: ${appointmentsList}`,
          5000,
        );
      }
    } catch (error) {
      console.error("Failed to check appointments:", error);
    }
  };

  const handleSelectConversation = async (
    conversationId: string,
    otherUser: User,
  ) => {
    setSelectedConversation(conversationId);
    setSelectedUser(otherUser);
    setIsChatbot(false);
    setShowSuggestions(false);
    await loadConversationMessages(conversationId, otherUser.name || "Patient");
  };

  const handleSelectChatbot = () => {
    setSelectedConversation("chatbot");
    setSelectedUser(null);
    setIsChatbot(true);
    setShowSuggestions(true);
    isInitializedRef.current = false;
    setWelcomeShown(false);
  };

  const loadConversationMessages = async (
    conversationId: string,
    senderName?: string,
  ) => {
    try {
      setLoading(true);
      const res = await conversationApi.getById(conversationId);
      const data = res.data?.data;
      const rawMessages = data?.messages || [];

      const formattedMessages = rawMessages.map((msg: any, idx: number) => ({
        id: msg._id || `${idx}-${Date.now()}`,
        sender: {
          id: msg.sender?._id || msg.sender?.id || msg.sender,
          name: msg.sender?.name || "Unknown",
          avatar: msg.sender?.avatar,
        },
        type: (msg.type || "text") as "text" | "image" | "audio",
        content: msg.content,
        imageUrl: msg.imageUrl,
        audioUrl: msg.audioUrl,
        timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
        isOwn:
          msg.sender?._id?.toString() === user?._id?.toString() ||
          msg.sender?.toString() === user?._id?.toString() ||
          msg.sender === user?._id,
        role: "user" as const,
      }));

      setMessages(formattedMessages as Message[]);

      const hasNewMessages = rawMessages.some(
        (msg: any) =>
          msg.sender?._id?.toString() !== user?._id?.toString() &&
          msg.sender?.toString() !== user?._id?.toString() &&
          msg.sender !== user?._id,
      );

      if (hasNewMessages && senderName) {
        const lastMessage = rawMessages[rawMessages.length - 1];
        if (
          lastMessage.sender?._id?.toString() !== user?._id?.toString() &&
          lastMessage.sender?.toString() !== user?._id?.toString() &&
          lastMessage.sender !== user?._id
        ) {
          const preview = lastMessage.content
            ? lastMessage.content.substring(0, 50)
            : lastMessage.type === "image"
              ? "Hình ảnh"
              : lastMessage.type === "audio"
                ? "Tin nhắn thoại"
                : "Tin nhắn";
          toast.info(`${senderName}: ${preview}`);
        }
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendText = async (content: string) => {
    if (!selectedConversation || !user) return;

    if (isChatbot) {
      setShowSuggestions(false);
      const userMsg: Message = {
        id: Date.now().toString(),
        sender: {
          id: user._id || user.id || "unknown",
          name: user.name || "Bác sĩ",
          avatar: user.avatar,
        },
        type: "text",
        content,
        timestamp: new Date().toISOString(),
        isOwn: true,
      };
      setMessages((prev) => [...prev, userMsg]);

      const newHistory: ChatMsg[] = [
        ...chatbotHistory,
        {
          id: Date.now().toString(),
          role: "user",
          content,
          timestamp: new Date().toISOString(),
        },
      ];
      setChatbotHistory(newHistory);

      localStorage.setItem(SESSION_KEY, sessionId || "");
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));

      try {
        setLoading(true);
        const res = await chatApi.privateChat(
          content,
          newHistory.map((h) => ({ role: h.role, content: h.content })),
          sessionId || undefined,
        );
        const aiResponse =
          res.data?.data?.reply ||
          res.data?.reply ||
          "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại.";

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: {
            id: "ai-assistant",
            name: "Trợ lý Nha khoa AI",
            avatar: undefined,
          },
          type: "text",
          content: aiResponse,
          timestamp: new Date().toISOString(),
          isOwn: false,
        };
        setMessages((prev) => [...prev, aiMsg]);

        const finalHistory = [
          ...newHistory,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: aiResponse,
            timestamp: new Date().toISOString(),
          },
        ];
        setChatbotHistory(finalHistory as ChatMsg[]);

        localStorage.setItem(HISTORY_KEY, JSON.stringify(finalHistory));

        const newSessionId = res.data?.data?.sessionId || res.data?.sessionId;
        if (newSessionId) {
          setSessionId(newSessionId);
          localStorage.setItem(SESSION_KEY, newSessionId);
        }
      } catch (error) {
        console.error("Failed to chat with AI:", error);
        toast.error("Lỗi giao tiếp với AI. Vui lòng thử lại.");
        setMessages((prev) => prev.slice(0, -1));
        setChatbotHistory((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    } else {
      const userMsg: Message = {
        id: Date.now().toString(),
        sender: {
          id: user._id || user.id || "unknown",
          name: user.name || "Bác sĩ",
          avatar: user.avatar,
        },
        type: "text",
        content,
        timestamp: new Date().toISOString(),
        isOwn: true,
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        await conversationApi.sendMessage(selectedConversation, {
          content,
          type: "text",
        });
      } catch (error) {
        console.error("Failed to send message:", error);
        toast.error("Failed to send message");
      }
    }
  };

  const handleSendImage = async (file: File) => {
    if (!selectedConversation || !user) return;

    if (isChatbot) {
      toast.info("Gửi hình ảnh không hỗ trợ cho AI chatbot");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", file);
      if (selectedUser) {
        formData.append("patientId", selectedUser._id || selectedUser.id || "");
      }

      const res = await imageApi.upload(formData);
      const imageUrl = res.data?.data?.url || res.data?.url;

      if (!imageUrl) {
        throw new Error("No image URL returned");
      }

      const userMsg: Message = {
        id: Date.now().toString(),
        sender: {
          id: user._id || user.id || "unknown",
          name: user.name || "Bác sĩ",
          avatar: user.avatar,
        },
        type: "image",
        imageUrl,
        timestamp: new Date().toISOString(),
        isOwn: true,
      };
      setMessages((prev) => [...prev, userMsg]);

      await conversationApi.sendMessage(selectedConversation, {
        content: "Image",
        type: "image",
        imageUrl,
      });
      toast.success("Image sent successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleSendAudio = async (file: File) => {
    if (!selectedConversation || !user) return;

    if (isChatbot) {
      toast.info("Gửi tin nhắn thoại không hỗ trợ cho AI chatbot");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("audio", file);
      if (selectedUser) {
        formData.append("patientId", selectedUser._id || selectedUser.id || "");
      }

      const res = await imageApi.upload(formData);
      const audioUrl = res.data?.data?.url || res.data?.url;

      if (!audioUrl) {
        throw new Error("No audio URL returned");
      }

      const userMsg: Message = {
        id: Date.now().toString(),
        sender: {
          id: user._id || user.id || "unknown",
          name: user.name || "Bác sĩ",
          avatar: user.avatar,
        },
        type: "audio",
        audioUrl,
        audioName: file.name,
        timestamp: new Date().toISOString(),
        isOwn: true,
      };
      setMessages((prev) => [...prev, userMsg]);

      await conversationApi.sendMessage(selectedConversation, {
        content: "Voice message",
        type: "audio",
        audioUrl,
      });
      toast.success("Voice message sent successfully");
    } catch (error) {
      console.error("Audio upload error:", error);
      toast.error("Failed to send voice message");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = async (text: string) => {
    setShowSuggestions(false);
    await handleSendText(text);
  };

  const handleClearChatbotHistory = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa lịch sử chat với AI?")) return;
    if (sessionId) {
      try {
        await chatApi.deleteSession(sessionId);
      } catch {
        // Ignore errors
      }
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

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <DoctorSidebar />
      <div className="flex-1 lg:ml-0 min-w-0 flex flex-col">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 12px rgba(109,40,217,0.3)" }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Tin nhắn</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {isChatbot ? "Trợ lý AI" : selectedUser ? `Chat với ${selectedUser.name}` : "Chọn cuộc trò chuyện"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isChatbot && messages.length > 0 && (
              <button
                onClick={handleClearChatbotHistory}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa lịch sử
              </button>
            )}
            {/* AI indicator badge */}
            {isChatbot && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #7c3aed15, #6d28d915)", color: "#7c3aed", border: "1px solid #7c3aed30" }}>
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                AI Assistant
              </div>
            )}
          </div>
        </div>

        {/* Chat container */}
        <div className="flex-1 flex gap-4 p-6 lg:p-8 min-h-0">
          {/* Conversation List */}
          <div className="w-72 flex-shrink-0">
            <ConversationList
              onSelectConversation={handleSelectConversation}
              onSelectChatbot={handleSelectChatbot}
              loading={loading}
              isChatbotSelected={isChatbot}
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1 min-w-0 flex flex-col">
            {isChatbot ? (
              <div className="flex flex-col h-full">
                <ChatMessage
                  messages={messages}
                  onSendText={handleSendText}
                  onSendImage={handleSendImage}
                  onSendAudio={handleSendAudio}
                  loading={loading}
                  title="Trợ lý Nha khoa AI"
                  placeholder="Hỏi tôi về sức khỏe răng miệng..."
                  showQuickReplies={showSuggestions}
                  quickReplies={QUICK_REPLIES.greeting}
                  onQuickReply={handleQuickReply}
                  aiName="Trợ lý Nha khoa AI"
                  aiAvatar="🤖"
                />
              </div>
            ) : selectedConversation && selectedUser ? (
              <ChatMessage
                messages={messages}
                onSendText={handleSendText}
                onSendImage={handleSendImage}
                onSendAudio={handleSendAudio}
                loading={loading}
                title={`Chat với ${selectedUser.name || "Bệnh nhân"}`}
                placeholder="Nhập tin nhắn..."
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
                {/* Decorative background */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #6d28d9, transparent)" }} />
                </div>

                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg, #7c3aed15, #6d28d915)" }}>
                    <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="font-black text-slate-800 text-xl mb-2">Chọn một cuộc trò chuyện</p>
                  <p className="text-sm text-slate-400 max-w-xs mx-auto">
                    Chọn một bệnh nhân từ danh sách bên trái hoặc trò chuyện với trợ lý AI
                  </p>

                  {/* Quick action buttons */}
                  <div className="flex flex-wrap justify-center gap-3 mt-6">
                    <button
                      onClick={handleSelectChatbot}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(109,40,217,0.4)" }}
                    >
                      <span className="text-lg">🤖</span>
                      Chat với AI
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
