import { useState, useRef } from "react";
import DoctorSidebar from "../components/layout/DoctorSidebar";
import PatientSidebar from "../components/layout/PatientSidebar";
import { useAuth } from "../context/AuthContext";
import { useVideoCall } from "../hooks/useVideoCall";

function formatDuration(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ─── Incoming call modal ──────────────────────────────────────────────────────
function IncomingCallModal({ callerName, onAccept, onReject }: { callerName: string; onAccept: () => void; onReject: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6 w-80 animate-bounce-in">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-4xl shadow-lg">
          📞
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800">{callerName}</p>
          <p className="text-sm text-slate-500 mt-1">Đang gọi cho bạn...</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onReject}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white text-2xl flex items-center justify-center shadow-lg transition-all hover:scale-110 hover:shadow-red-200">
            📵
          </button>
          <button onClick={onAccept}
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-2xl flex items-center justify-center shadow-lg transition-all hover:scale-110 hover:shadow-emerald-200 animate-pulse">
            📞
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User picker card ────────────────────────────────────────────────────────
function UserPicker({ users, onCall, disabled }: { users: any[]; onCall: (id: string, name: string) => void; disabled: boolean }) {
  if (users.length === 0) {
    return (
      <div className="card p-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">👥</span>
        </div>
        <p className="text-sm text-slate-400 font-medium">Không có người dùng trực tuyến</p>
      </div>
    );
  }
  return (
    <div className="card p-5">
      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
        Người dùng trực tuyến ({users.length})
      </h3>
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.userId}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${u.inCall ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800">{u.name}</p>
                <p className={`text-xs ${u.inCall ? "text-amber-600" : "text-emerald-600"}`}>
                  {u.inCall ? "🔴 Đang trong cuộc gọi" : "🟢 Sẵn sàng"}
                </p>
              </div>
            </div>
            {u.inCall ? (
              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold">Đang bận</span>
            ) : (
              <button onClick={() => onCall(u.userId, u.name)} disabled={disabled}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 hover:shadow-md"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", color: "white", boxShadow: "0 2px 8px rgba(14,165,233,.3)" }}>
                📹 Gọi
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Voice to text ────────────────────────────────────────────────────────────
function VoiceToText() {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggle = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Trình duyệt không hỗ trợ nhận dạng giọng nói"); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.lang = "vi-VN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          🎙️ Voice to Text
        </h3>
        <button onClick={toggle}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${listening ? "bg-red-500 text-white animate-pulse" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}>
          {listening ? "⏹ Dừng" : "▶ Bắt đầu"}
        </button>
      </div>
      <div className="min-h-14 p-3 bg-slate-50 rounded-xl border text-sm text-slate-700 relative">
        {transcript || <span className="text-slate-400">Nhấn "Bắt đầu" rồi nói...</span>}
        {transcript && (
          <button onClick={() => setTranscript("")}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs transition">✕</button>
        )}
      </div>
      {transcript && (
        <button onClick={() => navigator.clipboard.writeText(transcript)}
          className="mt-2 text-xs text-emerald-600 hover:underline">📋 Sao chép</button>
      )}
    </div>
  );
}

// ─── Photo gallery ────────────────────────────────────────────────────────────
function PhotoGallery({ photos, onClose }: { photos: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800">📸 Ảnh đã chụp ({photos.length})</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {photos.map((src, i) => (
            <div key={i} className="relative group">
              <img src={src} className="w-full rounded-xl object-cover" alt={`snapshot-${i}`} />
              <a href={src} download={`snapshot-${i + 1}.png`}
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-emerald-500 text-white text-xs px-2 py-1 rounded-lg transition-all">⬇ Tải</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VideoCallPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor" || user?.role === "admin";

  const {
    localVideoRef, remoteVideoRef, callState, onlineUsers,
    micOn, camOn, duration, error, busyNotice,
    callUser, acceptCall, rejectCall, endCall,
    toggleMic, toggleCam, capturePhoto,
    setError, setBusyNotice,
  } = useVideoCall();

  const [photos, setPhotos] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  const handleCapture = () => {
    const dataUrl = capturePhoto();
    if (dataUrl) setPhotos(prev => [...prev, dataUrl]);
  };

  const isInCall = callState.status === "connected" || callState.status === "connecting";
  const isBusy = isInCall || callState.status === "calling" || callState.status === "incoming";

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #f0f9ff 100%)" }}>
      {isDoctor ? <DoctorSidebar /> : <PatientSidebar />}
      <div className="flex-1 min-w-0">

        {/* Incoming call */}
        {callState.status === "incoming" && (
          <IncomingCallModal
            callerName={callState.callerName || "Người dùng"}
            onAccept={acceptCall}
            onReject={rejectCall}
          />
        )}

        {/* Gallery */}
        {showGallery && <PhotoGallery photos={photos} onClose={() => setShowGallery(false)} />}

        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3 border-b border-slate-200/60">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>📹</span> Video Call
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Tư vấn nha khoa qua video bảo mật WebRTC</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {photos.length > 0 && (
              <button onClick={() => setShowGallery(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", color: "white", boxShadow: "0 2px 8px rgba(14,165,233,.3)" }}>
                📸 {photos.length} ảnh
              </button>
            )}
            {callState.status === "connected" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ background: "#d1fae5", border: "1px solid #a7f3d0" }}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-emerald-700 font-mono">{formatDuration(duration)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
          {/* Notices */}
          {error && (
            <div className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-semibold animate-fade-in">
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 transition">✕</button>
            </div>
          )}
          {busyNotice && (
            <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-semibold animate-fade-in">
              <span>🔴 {busyNotice}</span>
              <button onClick={() => setBusyNotice("")} className="text-amber-400 hover:text-amber-600 transition">✕</button>
            </div>
          )}
          {callState.status === "calling" && (
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 font-semibold animate-fade-in">
              <div className="flex gap-1">
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
              Đang gọi cho <strong>{callState.remoteUserName}</strong>...
              <button onClick={endCall}
                className="ml-auto text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-200 transition font-semibold">Hủy</button>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Video + Controls */}
            <div className="xl:col-span-2 space-y-4">
              {/* Video Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Remote */}
                <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  {!isInCall && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-4xl mb-3">
                        {isDoctor ? "👤" : "👨‍⚕️"}
                      </div>
                      <p className="font-semibold">{callState.remoteUserName || (isDoctor ? "Bệnh nhân" : "Bác sĩ")}</p>
                      <p className="text-white/60 text-sm mt-1">
                        {callState.status === "idle" ? "Chờ kết nối..." : "Cuộc gọi đã kết thúc"}
                      </p>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 rounded-lg text-white text-xs font-semibold backdrop-blur-sm">
                    {callState.remoteUserName || (isDoctor ? "👤 Bệnh nhân" : "👨‍⚕️ Bác sĩ")}
                  </div>
                </div>

                {/* Local */}
                <div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  {!isInCall && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-4xl mb-3">
                        {isDoctor ? "👨‍⚕️" : "👤"}
                      </div>
                      <p className="font-semibold">{user?.name || "Bạn"}</p>
                      <p className="text-white/60 text-sm mt-1">Camera chưa bật</p>
                    </div>
                  )}
                  {!camOn && isInCall && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                      <span className="text-4xl">📵</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 rounded-lg text-white text-xs font-semibold backdrop-blur-sm">
                    {isDoctor ? "👨‍⚕️ Bác sĩ (Bạn)" : "👤 Bạn"}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="card p-4 flex items-center justify-center gap-3">
                {isInCall ? (
                  <>
                    <button onClick={toggleMic}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-sm ${micOn ? "bg-slate-100 hover:bg-slate-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                      {micOn ? "🎙️" : "🔇"}
                    </button>
                    <button onClick={toggleCam}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-sm ${camOn ? "bg-slate-100 hover:bg-slate-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                      {camOn ? "📷" : "📵"}
                    </button>
                    <button onClick={handleCapture}
                      className="w-14 h-14 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center text-2xl transition-all shadow-sm hover:shadow-md">
                      📸
                    </button>
                    <button onClick={endCall}
                      className="w-16 h-16 rounded-2xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-2xl transition-all shadow-lg hover:shadow-red-200 hover:shadow-xl">
                      📵
                    </button>
                  </>
                ) : (
                  <div className="text-center text-slate-400 py-3">
                    <p className="text-sm">Chọn người dùng bên phải để bắt đầu cuộc gọi</p>
                  </div>
                )}
              </div>

              {/* Voice to Text */}
              <VoiceToText />
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              <UserPicker users={onlineUsers} onCall={callUser} disabled={isBusy} />

              <div className="card p-5" style={{ background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)", border: "1px solid #a7f3d0" }}>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">ℹ️ Về tư vấn video</h3>
                <div className="space-y-3">
                  {[
                    { icon: "🔒", text: "Cuộc gọi mã hóa end-to-end qua WebRTC" },
                    { icon: "⚡", text: "Kết nối P2P trực tiếp, độ trễ thấp" },
                    { icon: "📸", text: "Chụp ảnh màn hình trong cuộc gọi" },
                    { icon: "🎙️", text: "Chuyển giọng nói sang văn bản" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
