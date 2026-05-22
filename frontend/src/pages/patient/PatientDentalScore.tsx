import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientSidebar from "../../components/layout/PatientSidebar";
import { scoreApi } from "../../services/api";
import type { DentalScore } from "../../types";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, RadialLinearScale,
  ArcElement, Filler, Tooltip, Legend,
} from "chart.js";
import { Line, Radar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  RadialLinearScale, ArcElement, Filler, Tooltip, Legend,
);

const MOCK_SCORE: DentalScore = {
  overall: 78, gumHealth: 82, toothDecay: 70,
  alignment: 88, cleanliness: 75,
  history: [
    { date: "T1", score: 65 }, { date: "T2", score: 68 },
    { date: "T3", score: 72 }, { date: "T4", score: 70 },
    { date: "T5", score: 74 }, { date: "T6", score: 78 },
  ],
};

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
          <circle cx="44" cy="44" r={r} fill="none"
            stroke={color} strokeWidth="7"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{value}</span>
        </div>
      </div>
      <p className="text-xs font-bold text-slate-600 text-center">{label}</p>
    </div>
  );
}

export default function PatientDentalScore() {
  const [score, setScore] = useState<DentalScore>(MOCK_SCORE);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    scoreApi.getMine()
      .then((res) => setScore(res.data?.data || res.data || MOCK_SCORE))
      .catch(() => setScore(MOCK_SCORE))
      .finally(() => setLoading(false));
  }, []);

  const overall = score.overall;
  const overallLabel = overall >= 80 ? "Xuất sắc" : overall >= 60 ? "Khá tốt" : "Cần cải thiện";

  const lineData = {
    labels: score.history.map((h) => h.date),
    datasets: [{
      label: "Điểm sức khỏe",
      data: score.history.map((h) => h.score),
      fill: true,
      backgroundColor: "rgba(14,165,233,0.06)",
      borderColor: "#0ea5e9",
      tension: 0.4,
      pointBackgroundColor: "#0ea5e9",
      pointRadius: 5,
      pointHoverRadius: 8,
    }],
  };

  const radarData = {
    labels: ["Nướu", "Sâu răng", "Khớp cắn", "Vệ sinh", "Tổng thể"],
    datasets: [{
      label: "Điểm của bạn",
      data: [score.gumHealth, score.toothDecay, score.alignment, score.cleanliness, score.overall],
      fill: true,
      backgroundColor: "rgba(14,165,233,0.1)",
      borderColor: "#0ea5e9",
      pointBackgroundColor: "#0ea5e9",
      pointRadius: 4,
    }],
  };

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, grid: { color: "#f1f5f9" }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  const radarOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      r: { min: 0, max: 100, ticks: { stepSize: 25, font: { size: 10 } }, grid: { color: "#e2e8f0" } },
    },
    plugins: { legend: { display: false } },
  };

  const metrics = [
    { label: "Nướu", value: score.gumHealth, color: "#10b981" },
    { label: "Sâu răng", value: score.toothDecay, color: "#f59e0b" },
    { label: "Khớp cắn", value: score.alignment, color: "#0ea5e9" },
    { label: "Vệ sinh", value: score.cleanliness, color: "#8b5cf6" },
  ];

  const tips = [
    {
      emoji: "🌞",
      title: "Đánh răng",
      color: "#0ea5e9",
      bg: "bg-blue-50", border: "border-blue-100",
      score: score.cleanliness,
      advice: score.cleanliness < 75
        ? "Hãy đánh răng đủ 2 phút, 2 lần mỗi ngày để loại bỏ mảng bám hiệu quả."
        : "Tuyệt vời! Thói quen đánh răng của bạn rất tốt. Hãy duy trì nhé!",
    },
    {
      emoji: "🪥",
      title: "Dùng chỉ nha khoa",
      color: "#14b8a6",
      bg: "bg-teal-50", border: "border-teal-100",
      score: score.gumHealth,
      advice: score.gumHealth < 80
        ? "Dùng chỉ nha khoa hàng ngày để giảm viêm nướu và loại bỏ thức ăn kẹt."
        : "Nướu của bạn rất khỏe mạnh! Hãy tiếp tục duy trì.",
    },
    {
      emoji: "🍎",
      title: "Chế độ ăn uống",
      color: "#f43f5e",
      bg: "bg-rose-50", border: "border-rose-100",
      score: score.toothDecay,
      advice: score.toothDecay < 70
        ? "Giảm đồ ngọt và nước có ga để bảo vệ men răng và ngăn ngừa sâu răng."
        : "Chế độ ăn của bạn đang hỗ trợ tốt cho sức khỏe răng miệng!",
    },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <PatientSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Sức khỏe răng</h1>
            <p className="text-xs text-slate-400 mt-0.5">Theo dõi & cải thiện sức khỏe răng miệng</p>
          </div>
        </div>

        <div className="space-y-5 p-6 lg:p-8">
          {/* Hero Score Card */}
          <div className="relative overflow-hidden rounded-2xl p-8 text-slate-800 animate-fade-in"
            style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #ecfdf5 100%)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #d1fae5" }}>
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
              {/* Score ring */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 136 136">
                  <circle cx="68" cy="68" r="56" fill="none" stroke="#f1f5f9" strokeWidth="11" />
                  <circle cx="68" cy="68" r="56" fill="none" stroke="#0f766e" strokeWidth="11"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - overall / 100)}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-800">{loading ? "—" : overall}</span>
                  <span className="text-xs font-semibold text-slate-400">/100</span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <p className="text-emerald-600 text-xs font-bold tracking-wide uppercase">Điểm sức khỏe tổng thể</p>
                <h2 className="text-3xl font-black text-slate-900 mt-1">{overallLabel}</h2>
                <p className="text-slate-500 text-sm mt-3 max-w-lg leading-relaxed">
                  Điểm sức khỏe răng miệng được tính dựa trên tình trạng nướu, nguy cơ sâu răng, khớp cắn và mức độ vệ sinh từ các lần khám gần đây.
                </p>
                <button onClick={() => navigate("/patient/appointments")}
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)", boxShadow: "0 4px 14px rgba(13,148,136,0.35)" }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>
                  Đặt lịch khám
                </button>
              </div>
            </div>
          </div>

          {/* Score Rings + Progress Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Detail Rings */}
            <div className="card p-6 border border-slate-100 animate-fade-in stagger-1">
              <h3 className="text-sm font-bold text-slate-800 mb-6">Phân tích chi tiết</h3>
              <div className="flex flex-wrap justify-around gap-6">
                {metrics.map((m) => (
                  <ScoreRing key={m.label} value={m.value} label={m.label} color={m.color} />
                ))}
              </div>
            </div>

            {/* Progress Bars */}
            <div className="card p-6 border border-slate-100 animate-fade-in stagger-2">
              <h3 className="text-sm font-bold text-slate-800 mb-5">Chỉ số chi tiết</h3>
              <div className="space-y-5">
                {metrics.map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">{m.label}</span>
                      <span className="text-sm font-black" style={{ color: m.color }}>{m.value}/100</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${m.value}%`, background: `linear-gradient(90deg, ${m.color}, ${m.color}80)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-6 border border-slate-100 animate-fade-in stagger-3">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Lịch sử điểm số</h3>
              <div className="h-52">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
            <div className="card p-6 border border-slate-100 animate-fade-in stagger-4">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Radar sức khỏe</h3>
              <div className="h-52">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
          </div>

          {/* Personalized Tips */}
          <div className="card p-6 border border-slate-100 animate-fade-in stagger-5">
            <h3 className="text-sm font-bold text-slate-800 mb-5">Lời khuyên cá nhân hóa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tips.map((t, i) => (
                <div key={i} className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
                  style={{ background: t.score < 75 ? `${t.color}06` : `${t.color}04`, borderColor: t.score < 75 ? `${t.color}30` : `${t.color}20` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-2xl"
                    style={{ background: `${t.color}15` }}>
                    {t.emoji}
                  </div>
                  <p className="font-black text-sm text-slate-800">{t.title}</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{t.advice}</p>
                  <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${t.score}%`, background: t.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
