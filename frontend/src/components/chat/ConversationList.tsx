import { useState, useEffect } from "react";
import { conversationApi } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import type { User } from "../../types";

interface Conversation {
  id: string;
  conversationId: string;
  otherUser: User;
  lastMessage?: { content: string; timestamp: string };
  messageCount: number;
  updatedAt: string;
}

interface Props {
  onSelectConversation: (conversationId: string, otherUser: User) => void;
  onSelectChatbot?: () => void;
  loading?: boolean;
  isChatbotSelected?: boolean;
}

export default function ConversationList({
  onSelectConversation,
  onSelectChatbot,
  isChatbotSelected,
}: Props) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
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
    } catch (error) {
      toast.error("Không thể tải cuộc trò chuyện");
    } finally {
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectUser = async (user: User) => {
    try {
      const res = await conversationApi.findOrCreate(user._id || user.id || "");
      const conversation = res.data?.data;
      if (conversation) {
        onSelectConversation(conversation.conversationId || conversation.id, user);
        setShowUserList(false);
        setSearchTerm("");
        loadConversations();
      }
    } catch {
      toast.error("Không thể bắt đầu cuộc trò chuyện");
    }
  };

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)" }}>
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100"
        style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0f766e 100%)" }}>
        <h3 className="font-black text-white text-base mb-3">Tin nhắn</h3>
        <div className="flex gap-2">
          <button
            onClick={onSelectChatbot}
            className={`flex-1 text-sm py-2 px-3 rounded-xl transition-all font-semibold ${
              isChatbotSelected
                ? "text-white shadow-md"
                : "text-teal-100/80 hover:text-white hover:bg-white/10"
            }`}
            style={isChatbotSelected ? { background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" } : {}}
          >
            🤖 AI Chat
          </button>
          <button
            onClick={loadAvailableUsers}
            className="flex-1 text-sm py-2 px-3 rounded-xl transition font-semibold text-teal-800 bg-white/90 hover:bg-white"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          >
            {loadingUsers ? "..." : "+ Mới"}
          </button>
        </div>
      </div>

      {/* New Chat Modal */}
      {showUserList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden" style={{ animation: "slideUp 0.3s ease" }}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-black text-slate-800 text-base">Chọn người trò chuyện</h4>
              <button
                onClick={() => setShowUserList(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-3 border-b border-slate-100">
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 max-h-72">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <button
                  key={user._id || user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition flex items-center gap-3 group"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 2px 8px rgba(14,165,233,0.3)" }}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )) : (
                <div className="text-center py-10 px-4">
                  <p className="text-sm text-slate-400">{loadingUsers ? "Đang tải..." : "Không tìm thấy người dùng"}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loadingConversations ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Đang tải...</p>
            </div>
          </div>
        ) : conversations.length > 0 ? (
          <div className="p-2 space-y-0.5">
            {conversations.map((conv) => (
              <button
                key={conv.conversationId}
                onClick={() => onSelectConversation(conv.conversationId || conv.id, conv.otherUser)}
                className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 2px 8px rgba(14,165,233,0.3)" }}
                  >
                    {conv.otherUser.avatar ? (
                      <img src={conv.otherUser.avatar} alt={conv.otherUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      conv.otherUser.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm text-slate-800 truncate">{conv.otherUser.name}</p>
                      {conv.lastMessage?.timestamp && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {conv.lastMessage?.content || "Chưa có tin nhắn"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)" }}>
              <svg className="w-7 h-7" style={{ color: "#14b8a6" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-bold text-slate-700 text-sm mb-1">Chưa có cuộc trò chuyện</p>
            <p className="text-xs text-slate-400 mb-4">Bắt đầu trò chuyện với AI hoặc bác sĩ</p>
            <button onClick={loadAvailableUsers} className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }}>
              Bắt đầu chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
