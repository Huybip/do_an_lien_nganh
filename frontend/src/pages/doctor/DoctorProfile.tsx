import { useState, useEffect } from "react"; // Doctor Profile Page
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import { doctorApi } from "../../services/api";

interface DoctorProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  qualifications: string[];
  experience: number;
  bio: string;
  degree?: string;
  workingHours: {
    monday:    { start: string; end: string; available: boolean };
    tuesday:   { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday:  { start: string; end: string; available: boolean };
    friday:    { start: string; end: string; available: boolean };
    saturday:  { start: string; end: string; available: boolean };
    sunday:    { start: string; end: string; available: boolean };
  };
}

export default function DoctorProfile() {
  const [profile, setProfile] = useState<DoctorProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qualInput, setQualInput] = useState("");

  const [form, setForm] = useState({
    phone: "",
    specialization: "",
    licenseNumber: "",
    experience: 0,
    bio: "",
    qualifications: [] as string[],
    degree: "Đại học",
    workingHours: {
      monday:    { start: "08:00", end: "17:00", available: true },
      tuesday:   { start: "08:00", end: "17:00", available: true },
      wednesday: { start: "08:00", end: "17:00", available: true },
      thursday:  { start: "08:00", end: "17:00", available: true },
      friday:    { start: "08:00", end: "17:00", available: true },
      saturday:  { start: "08:00", end: "12:00", available: false },
      sunday:    { start: "08:00", end: "12:00", available: false },
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await doctorApi.getMyProfile();
      const data = res.data?.data || res.data;
      if (data) {
        setProfile(data);
        setForm({
          phone: data.phone || "",
          specialization: data.specialization || "General Dentistry",
          licenseNumber: data.licenseNumber || "",
          experience: data.experience || 0,
          bio: data.bio || "",
          qualifications: Array.isArray(data.qualifications) ? data.qualifications : [],
          degree: data.degree || "Đại học",
          workingHours: data.workingHours || form.workingHours,
        });
      }
    } catch (err) {
      console.error("Failed to load doctor profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await doctorApi.updateMyProfile(form);
      setSuccess(true);
      setEditing(false);
      loadProfile();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save doctor profile:", err);
      alert("Cập nhật hồ sơ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const addQualification = () => {
    if (!qualInput.trim()) return;
    setForm({
      ...form,
      qualifications: [...form.qualifications, qualInput.trim()]
    });
    setQualInput("");
  };

  const removeQualification = (idx: number) => {
    setForm({
      ...form,
      qualifications: form.qualifications.filter((_, i) => i !== idx)
    });
  };

  const handleWorkingHourChange = (day: keyof typeof form.workingHours, field: "start" | "end" | "available", value: any) => {
    setForm({
      ...form,
      workingHours: {
        ...form.workingHours,
        [day]: {
          ...form.workingHours[day],
          [field]: value
        }
      }
    });
  };

  const daysLabels: Record<string, string> = {
    monday: "Thứ Hai",
    tuesday: "Thứ Ba",
    wednesday: "Thứ Tư",
    thursday: "Thứ Năm",
    friday: "Thứ Sáu",
    saturday: "Thứ Bảy",
    sunday: "Chủ Nhật",
  };

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f5f3ff 0%, #ede9fe 40%, #f3e8ff 100%)" }}>
      <DoctorSidebar />
      <div className="flex-1 lg:ml-0 min-w-0 overflow-y-auto">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-purple-200/50">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
            <p className="text-xs text-slate-400 mt-0.5">Quản lý chuyên môn & giờ làm việc</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-5 p-6 lg:p-8 animate-fade-in">
          {success && (
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold text-emerald-700 animate-scale-in"
              style={{ background: "linear-gradient(135deg, #d1fae5, #ecfdf5)", border: "1px solid #a7f3d0" }}>
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              Cập nhật hồ sơ cá nhân thành công!
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Đang tải hồ sơ...</p>
            </div>
          ) : !profile ? (
            <div className="card text-center py-16">
              <p className="text-slate-500">Không tìm thấy hồ sơ bác sĩ.</p>
            </div>
          ) : (
            <>
              {/* Profile Card */}
              <div className="card p-6 border border-slate-100 animate-scale-in bg-white/80">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg"
                      style={{ background: "linear-gradient(135deg, #a855f7, #7e22ce)", boxShadow: "0 8px 24px rgba(168,85,247,0.35)" }}>
                      {profile.name?.charAt(0)?.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-black text-slate-800">Dr. {profile.name} <span className="text-sm font-semibold text-purple-600">({profile.degree || "Đại học"})</span></h2>
                    <div className="flex items-center gap-2 mt-1.5 justify-center sm:justify-start flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-purple-600">
                        👨‍⚕️ Bác sĩ chuyên khoa
                      </span>
                      <span className="text-sm text-slate-400 font-medium">{profile.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="btn-purple flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    {editing ? "Hủy" : "Chỉnh sửa"}
                  </button>
                </div>
              </div>

              {/* Form editing / viewing */}
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Column: Specialty & Bio */}
                  <div className="space-y-5">
                    <div className="card p-6 border border-slate-100 bg-white/70 space-y-4">
                      <h3 className="text-base font-bold text-slate-800">Thông tin chuyên môn</h3>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Học hàm/Bằng cấp</label>
                        <select
                          className="input focus:outline-none"
                          disabled={!editing}
                          value={form.degree}
                          onChange={(e) => setForm({ ...form, degree: e.target.value })}
                        >
                          <option value="Đại học">Đại học</option>
                          <option value="Thạc sỹ">Thạc sỹ</option>
                          <option value="Tiến sỹ">Tiến sỹ</option>
                          <option value="Phó giáo sư">Phó giáo sư</option>
                          <option value="Giáo sư">Giáo sư</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chuyên khoa</label>
                        <input
                          type="text"
                          className="input"
                          disabled={!editing}
                          value={form.specialization}
                          onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Số điện thoại</label>
                        <input
                          type="tel"
                          className="input"
                          disabled={!editing}
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Số giấy phép hành nghề</label>
                          <input
                            type="text"
                            className="input"
                            disabled={!editing}
                            value={form.licenseNumber}
                            onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kinh nghiệm (Năm)</label>
                          <input
                            type="number"
                            className="input"
                            disabled={!editing}
                            value={form.experience}
                            onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tiểu sử (Giới thiệu)</label>
                        <textarea
                          className="input resize-none"
                          rows={4}
                          disabled={!editing}
                          value={form.bio}
                          onChange={(e) => setForm({ ...form, bio: e.target.value })}
                          placeholder="Mô tả quá trình đào tạo và phong cách làm việc..."
                        />
                      </div>
                    </div>

                    {/* Qualifications */}
                    <div className="card p-6 border border-slate-100 bg-white/70 space-y-4">
                      <h3 className="text-base font-bold text-slate-800">Bằng cấp & Chứng chỉ</h3>

                      {editing && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="input"
                            placeholder="VD: Chứng chỉ cấy ghép Implant - Đại học Y Hà Nội"
                            value={qualInput}
                            onChange={(e) => setQualInput(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={addQualification}
                            className="px-4 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition"
                          >
                            +
                          </button>
                        </div>
                      )}

                      <div className="space-y-2">
                        {form.qualifications.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-2">Chưa thêm bằng cấp nào</p>
                        ) : (
                          form.qualifications.map((q, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/50 border border-purple-100">
                              <span className="text-sm font-semibold text-slate-700">🎓 {q}</span>
                              {editing && (
                                <button
                                  type="button"
                                  onClick={() => removeQualification(idx)}
                                  className="w-5 h-5 rounded bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center text-xs"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Weekly Hours */}
                  <div className="card p-6 border border-slate-100 bg-white/70 space-y-4">
                    <h3 className="text-base font-bold text-slate-800">Cài đặt giờ làm việc mẫu trong tuần</h3>
                    <p className="text-xs text-slate-400">Giờ làm việc làm căn cứ gợi ý khi Admin gán lịch trực</p>

                    <div className="space-y-3">
                      {Object.keys(form.workingHours).map((dayKey) => {
                        const day = dayKey as keyof typeof form.workingHours;
                        const data = form.workingHours[day];
                        return (
                          <div key={day} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex-wrap">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                disabled={!editing}
                                checked={data.available}
                                onChange={(e) => handleWorkingHourChange(day, "available", e.target.checked)}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer disabled:cursor-default"
                              />
                              <span className="text-sm font-bold text-slate-700 w-24">{daysLabels[day]}</span>
                            </div>

                            {data.available ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  disabled={!editing}
                                  placeholder="08:00"
                                  className="w-16 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:border-purple-500 text-center font-mono font-bold"
                                  value={data.start}
                                  onChange={(e) => handleWorkingHourChange(day, "start", e.target.value)}
                                />
                                <span className="text-xs text-slate-400">–</span>
                                <input
                                  type="text"
                                  disabled={!editing}
                                  placeholder="17:00"
                                  className="w-16 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:border-purple-500 text-center font-mono font-bold"
                                  value={data.end}
                                  onChange={(e) => handleWorkingHourChange(day, "end", e.target.value)}
                                />
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-slate-400 italic">Nghỉ / Không làm việc</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-3 animate-fade-in">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #a855f7, #7e22ce)", boxShadow: "0 4px 14px rgba(168,85,247,0.4)" }}
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" d="M5 13l4 4L19 7"/>
                          </svg>
                          Lưu hồ sơ cá nhân
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        loadProfile();
                      }}
                      className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
