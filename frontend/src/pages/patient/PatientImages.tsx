import { useState, useRef } from "react";
import PatientSidebar from "../../components/layout/PatientSidebar";
import { imageApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import type { DentalImage } from "../../types";

const typeConfig: Record<string, { label: string; color: string; bg: string; border: string; emoji: string }> = {
  xray:  { label: "X-Quang", color: "#0ea5e9", bg: "bg-blue-50", border: "border-blue-100", emoji: "🔬" },
  photo: { label: "Ảnh chụp", color: "#14b8a6", bg: "bg-teal-50", border: "border-teal-100", emoji: "📷" },
  scan:  { label: "Quét 3D", color: "#8b5cf6", bg: "bg-violet-50", border: "border-violet-100", emoji: "🖥️" },
};

export default function PatientImages() {
  const { data: images, loading, refetch } = useApi<DentalImage[]>(() => imageApi.getMine());
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<DentalImage | null>(null);
  const [uploadType, setUploadType] = useState<"xray" | "photo" | "scan">("photo");
  const [description, setDescription] = useState("");
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, desc?: string) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    fd.append("type", uploadType);
    fd.append("description", desc || description);
    try {
      await imageApi.upload(fd);
      refetch();
      setShowUploadPanel(false);
      setDescription("");
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) await uploadFile(file);
  };

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <PatientSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hình ảnh</h1>
            <p className="text-xs text-slate-400 mt-0.5">{(images || []).length} hình ảnh nha khoa</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Type filter */}
            {(["photo", "xray", "scan"] as const).map((type) => {
              const cfg = typeConfig[type];
              return (
                <button key={type} onClick={() => {/* filter logic */}}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-500 hover:border-slate-300 transition">
                  {cfg.emoji} {cfg.label}
                </button>
              );
            })}
            <button onClick={() => setShowUploadPanel(!showUploadPanel)} className="btn-emerald">
              {showUploadPanel ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg> Đóng</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 4v16m8-8H4"/></svg> Tải lên</>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6 lg:p-8">
          {/* Upload Panel */}
          {showUploadPanel && (
            <div className="card p-6 animate-scale-in border border-slate-100">
              <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </span>
                Tải lên hình ảnh mới
              </h3>

              {/* Type selector */}
              <div className="flex gap-2 mb-4">
                {(["photo", "xray", "scan"] as const).map((type) => {
                  const cfg = typeConfig[type];
                  return (
                    <button key={type} onClick={() => setUploadType(type)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border-2 hover:-translate-y-0.5"
                      style={{
                        background: uploadType === type ? `${cfg.color}10` : "transparent",
                        borderColor: uploadType === type ? cfg.color : "#e2e8f0",
                        color: uploadType === type ? cfg.color : "#94a3b8",
                      }}>
                      <span className="mr-1">{cfg.emoji}</span>{cfg.label}
                    </button>
                  );
                })}
              </div>

              <input className="input mb-4"
                placeholder="Mô tả hình ảnh (ví dụ: X-quang hàm trên...)"
                value={description} onChange={(e) => setDescription(e.target.value)} />

              <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  dragOver ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                }`}
                onClick={() => !uploading && fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-[3px] border-emerald-300 border-t-emerald-600 animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-emerald-600">Đang tải lên...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                      style={{ background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)", color: "#14b8a6" }}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">Nhấp hoặc kéo file vào đây</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP tối đa 10MB</p>
                    </div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
          )}

          {/* Gallery */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl skeleton" />
              ))}
            </div>
          )}

          {!loading && (images || []).length === 0 && (
            <div className="card text-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <p className="font-black text-slate-700 text-lg mb-2">Chưa có hình ảnh nào</p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto mb-6">
                Tải lên hình ảnh nha khoa đầu tiên của bạn để theo dõi quá trình điều trị
              </p>
              <button onClick={() => setShowUploadPanel(true)} className="btn-emerald">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 4v16m8-8H4"/></svg>
                Tải lên hình ảnh
              </button>
            </div>
          )}

          {!loading && (images || []).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(images || []).map((img) => {
                const cfg = typeConfig[img.type] || typeConfig.photo;
                return (
                  <div key={img.id}
                    className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.06)" }}>
                    <img src={img.url} alt={img.description || "Dental image"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onClick={() => setPreview(img)} />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-3">
                      <button onClick={(e) => { e.stopPropagation(); imageApi.delete(img.id); refetch(); }}
                        className="self-end w-8 h-8 rounded-xl bg-red-500/90 text-white flex items-center justify-center text-xs hover:bg-red-600 transition backdrop-blur-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                          <span>{cfg.emoji}</span>{cfg.label}
                        </span>
                        {img.description && (
                          <p className="text-white/80 text-[10px] mt-1 leading-relaxed">{img.description}</p>
                        )}
                        {img.uploadedAt && (
                          <p className="text-white/50 text-[10px] mt-0.5">{new Date(img.uploadedAt).toLocaleDateString("vi-VN")}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)" }}
            onClick={() => setPreview(null)}>
            <div className="relative max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}>
              {/* Close */}
              <button onClick={() => setPreview(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>

              <img src={preview.url} alt={preview.description || "Dental image"}
                className="w-full max-h-[65vh] object-contain bg-slate-900" />

              <div className="p-6 bg-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-800 flex items-center gap-2">
                      {(() => { const cfg = typeConfig[preview.type] || typeConfig.photo; return (
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                          style={{ background: `${cfg.color}15`, color: cfg.color }}>{cfg.emoji}</span>
                      )})()}
                      {(typeConfig[preview.type] || typeConfig.photo).label}
                    </p>
                    {preview.uploadedAt && (
                      <p className="text-sm text-slate-400 mt-1">
                        {new Date(preview.uploadedAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    )}
                    {preview.description && <p className="text-sm text-slate-500 mt-1">{preview.description}</p>}
                  </div>
                  <button onClick={() => setPreview(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition flex-shrink-0">
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
