import { useState, useEffect, useRef } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import { salaryApi, doctorApi, unwrap } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToastContext } from "../../context/ToastContext";
import { salarySocketService } from "../../services/salarySocket"; 
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalaryDetailModal {
  salaryRecord: any;
  enrichedShiftDetails: any[];
  totalWorkingHours: number;
  totalDifficulty: number;
  hardCasesCount: number;
  hardPatientsCount: number;
  totalRevenue: number;
  dailyBreakdown: any[];
}

interface DoctorDegreeMap {
  [doctorId: string]: string;
}

export default function DoctorSalary() {
  const { user } = useAuth();
  const { toast } = useToastContext();
  const [activeTab, setActiveTab] = useState<"monthly" | "yearly">("monthly");
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  // ─── Doctor identity (fetched from backend on mount) ───
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ─── Salary data states ───
  const [currentSalary, setCurrentSalary] = useState<any>(null);
  const [loadingSalary, setLoadingSalary] = useState(false);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [loadingYearly, setLoadingYearly] = useState(false);
  const [monthlyList, setMonthlyList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // ─── Configuration from localStorage (shared with AdminSalary) ───
  const [basicHourlyRate, setBasicHourlyRate] = useState<number>(210000);
  const [degreeCoefficients, setDegreeCoefficients] = useState<Record<string, number>>({
    "Đại học": 1.2,
    "Thạc sỹ": 1.5,
    "Tiến sỹ": 2.0,
    "Phó giáo sư": 2.5,
    "Giáo sư": 3.0,
  });
  const [doctorDegrees, setDoctorDegrees] = useState<DoctorDegreeMap>({});

  // ─── Salary detail modal ───
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    salaryId: string | null;
    data: SalaryDetailModal | null;
    loading: boolean;
  }>({ open: false, salaryId: null, data: null, loading: false });

  // ─── Salary record ID for detail modal ───
  const [salaryRecordId, setSalaryRecordId] = useState<string | null>(null);

  // Track if we need to re-fetch after profile loads
  const profileLoadedRef = useRef(false);

  // Load config from localStorage
  useEffect(() => {
    const savedRate = localStorage.getItem("salary_basic_hourly_rate");
    if (savedRate) setBasicHourlyRate(Number(savedRate));

    const savedDegrees = localStorage.getItem("salary_degree_coefficients");
    if (savedDegrees) setDegreeCoefficients(JSON.parse(savedDegrees));

    const savedDocDegrees = localStorage.getItem("salary_doctor_degrees");
    if (savedDocDegrees) setDoctorDegrees(JSON.parse(savedDocDegrees));
  }, []);

  // ─── Fetch doctor's own profile on mount ───
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await doctorApi.getMyProfile();
        const doc = unwrap(res);
        setDoctorProfile(doc);

        const docId = doc.id || doc._id;

        // Sync degree from profile into doctorDegrees
        const dbDegree = doc.degree || "Đại học";
        setDoctorDegrees(prev => {
          if (prev[docId] !== dbDegree) {
            const updated = { ...prev, [docId]: dbDegree };
            localStorage.setItem("salary_doctor_degrees", JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      } catch (err) {
        console.error("Error fetching doctor profile:", err);
      } finally {
        setLoadingProfile(false);
        profileLoadedRef.current = true;
      }
    };
    fetchProfile();
  }, []);

  // Get doctor's ID from profile
  const doctorId = doctorProfile ? (doctorProfile.id || doctorProfile._id) : "";
  const userDegree = doctorId ? (doctorDegrees[doctorId] || doctorProfile?.degree || "Đại học") : "Đại học";
  const userCoeff = degreeCoefficients[userDegree] || 1.2;

  // ─── Fetch salary for selected month/year ───
  const fetchCurrentSalary = async () => {
    if (!doctorId) return;
    setLoadingSalary(true);
    try {
      const res = await salaryApi.calculate({
        doctorId,
        month: filterMonth,
        year: filterYear,
        basicHourlyRate,
        degreeCoefficient: userCoeff,
      });
      const data = unwrap(res);
      setCurrentSalary(data);
      // Save salary record ID for modal
      if (data && data._id) setSalaryRecordId(data._id);
    } catch {
      setCurrentSalary(null);
      setSalaryRecordId(null);
    } finally {
      setLoadingSalary(false);
    }
  };

  // ─── Fetch yearly trend (12 months) ───
  const fetchYearlyTrend = async () => {
    if (!doctorId) return;
    setLoadingYearly(true);
    try {
      const results = await Promise.all(
        Array.from({ length: 12 }, async (_, idx) => {
          const month = idx + 1;
          try {
            const res = await salaryApi.calculate({
              doctorId,
              month,
              year: filterYear,
              basicHourlyRate,
              degreeCoefficient: userCoeff,
            });
            const data = unwrap(res);
            return { ...data, month };
          } catch {
            return {
              month,
              totalShifts: 0,
              totalWorkingHours: 0,
              totalEquivalentHours: 0,
              totalAmount: 0,
              totalDifficulty: 0,
            };
          }
        })
      );
      setYearlyData(results);
    } catch {
      setYearlyData([]);
    } finally {
      setLoadingYearly(false);
    }
  };

  // ─── Fetch monthly list for current year ───
  const fetchMonthlyList = async () => {
    setLoadingList(true);
    try {
      const res = await salaryApi.mySalaries({ year: filterYear, limit: 50 });
      const records = unwrap<any[]>(res);
      setMonthlyList(records);
    } catch {
      setMonthlyList([]);
    } finally {
      setLoadingList(false);
    }
  };

  // ─── Fetch salary detail for modal ───
  const fetchSalaryDetail = async (salaryId: string) => {
    setDetailModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await salaryApi.getDetail(salaryId);
      setDetailModal(prev => ({ ...prev, data: unwrap(res), loading: false }));
    } catch {
      setDetailModal(prev => ({ ...prev, data: null, loading: false }));
    }
  };

  const handleOpenDetailModal = async () => {
    if (!salaryRecordId) {
      // Trigger calculation first to get a record
      await fetchCurrentSalary();
      return;
    }
    setDetailModal({ open: true, salaryId: salaryRecordId, data: null, loading: true });
    await fetchSalaryDetail(salaryRecordId);
  };

  // Trigger fetches when profile is loaded or filters change
  useEffect(() => {
    if (!doctorId) return;
    if (activeTab === "monthly") {
      fetchCurrentSalary();
      fetchMonthlyList();
    } else {
      fetchYearlyTrend();
    }
  }, [filterMonth, filterYear, activeTab, doctorId, userCoeff, basicHourlyRate]);

  // Re-calculate when salary record is saved (Admin syncs)
  const handleRefresh = () => {
    if (activeTab === "monthly") {
      fetchCurrentSalary();
      fetchMonthlyList();
    } else {
      fetchYearlyTrend();
    }
  };

  // ─── Real-time salary update via Socket ───
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId || !doctorId) return;

    // Connect to salary socket namespace
    salarySocketService.connect(userId, doctorId);

    // Listen for salary-updated events
    const unsubscribe = salarySocketService.onSalaryUpdated((data: {
      doctorId: string;
      month: number;
      year: number;
      totalAmount: number;
      status: string;
      updatedAt: string;
    }) => {
      // Only refresh if the update matches the currently viewed month/year
      if (data.month === filterMonth && data.year === filterYear) {
        toast.info("Lương tháng này vừa được cập nhật. Đang tải lại...");
        handleRefresh();
      }
    });

    return () => {
      unsubscribe();
      salarySocketService.disconnect();
    };
  }, [user, doctorId, filterMonth, filterYear]);

  // Current salary mapped
  const currentMonthData = currentSalary ? {
    shifts: currentSalary.totalShifts || 0,
    hours: currentSalary.totalWorkingHours || 0,
    equivHours: currentSalary.totalEquivalentHours || 0,
    difficulty: currentSalary.totalDifficulty || 0,
    amount: currentSalary.totalAmount || 0,
    shiftDetails: currentSalary.shiftDetails || [],
  } : null;

  // Yearly data mapped
  const yearlyMapped = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const rec = yearlyData.find((r: any) => r.month === m);
    return {
      month: `Tháng ${m}`,
      monthNum: m,
      shifts: rec?.totalShifts || 0,
      workingHours: rec?.totalWorkingHours || 0,
      equivHours: rec?.totalEquivalentHours || 0,
      difficulty: rec?.totalDifficulty || 0,
      amount: rec?.totalAmount || 0,
    };
  });

  // Line chart data
  const lineChartData = {
    labels: yearlyMapped.map(d => d.month),
    datasets: [
      {
        label: `Thu nhập năm ${filterYear} (VNĐ)`,
        data: yearlyMapped.map(d => d.amount),
        fill: true,
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderColor: "#7c3aed",
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: "#6d28d9",
        pointHoverRadius: 8,
        pointRadius: 5,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const rec = yearlyMapped[ctx.dataIndex];
            return [
              ` Thu nhập: ${rec.amount.toLocaleString("vi-VN")} đ`,
              ` Giờ làm việc: ${rec.workingHours.toFixed(1)} giờ`,
              ` Số ca khó: ${rec.difficulty > 0 ? Math.round(rec.difficulty / 0.2) : 0} ca`,
              ` Hệ số lương: ${userCoeff.toFixed(1)}`,
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: {
          callback: (v: any) => v >= 1000000 ? (v / 1000000).toFixed(1) + "M" : v.toLocaleString("vi-VN")
        }
      },
      x: { grid: { display: false } }
    }
  };

  // Difficulty badge helper
  const getDifficultyBadge = (difficulty: number) => {
    if (difficulty === 0.5) return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">Khó nhất</span>;
    if (difficulty === 0.3) return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">Phức tạp</span>;
    if (difficulty === 0.2) return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Trung bình</span>;
    return <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">Thông thường</span>;
  };

  const getShiftBadge = (shiftType: string, isWeekend: boolean) => {
    const colors = isWeekend
      ? "bg-violet-100 text-violet-700"
      : shiftType === "evening"
        ? "bg-blue-100 text-blue-700"
        : "bg-sky-100 text-sky-700";
    const label = shiftType === "morning" ? "Sáng" : shiftType === "afternoon" ? "Chiều" : "Tối";
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors}`}>{label}</span>;
  };

  const getDayOfWeekLabel = (dateString: string): string => {
    const date = new Date(dateString).getDay();
    const labels = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return labels[date];
  };

  const isWeekendDate = (dateString: string): boolean => {
    const day = new Date(dateString).getDay();
    return day === 0 || day === 6;
  };

  const formatCurrency = (amount: number) => amount.toLocaleString("vi-VN");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <DoctorSidebar />
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-violet-100 px-6 lg:px-10 py-5 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Bảng lương của tôi</h1>
            <p className="text-sm text-slate-400 mt-0.5">Phòng khám nha khoa VinaMec Dental</p>
          </div>
          {/* Doctor info badge */}
          <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-2xl px-5 py-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-black text-base shadow">
              {(doctorProfile?.name || user?.name || "D").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm">{doctorProfile?.name || user?.name}</p>
              <p className="text-xs text-violet-500 font-semibold">{userDegree} · Hệ số: <span className="text-violet-700 font-black">{userCoeff.toFixed(1)}</span></p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-10 py-6 space-y-6">

          {/* Configuration info bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Đơn giá/giờ", value: `${basicHourlyRate.toLocaleString("vi-VN")} đ`, color: "text-emerald-600" },
              { label: "Hệ số bằng cấp", value: `${userCoeff.toFixed(1)} (${userDegree})`, color: "text-violet-600" },
              { label: "Hệ số ca khó nhất", value: "+0.5/ca", color: "text-red-500" },
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-base">💰</div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{item.label}</p>
                  <p className={`font-black text-sm mt-0.5 ${item.color}`}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white border border-slate-100 rounded-2xl p-1.5 inline-flex shadow-sm">
            {[
              { id: "monthly", label: "📅 Theo tháng" },
              { id: "yearly", label: "📊 Theo năm" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "monthly" | "yearly")}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── MONTHLY TAB ─── */}
          {activeTab === "monthly" && (
            <div className="space-y-6">
              {/* Month/Year filter */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-wrap items-center gap-4">
                <span className="text-sm font-bold text-slate-500">Xem lương tháng:</span>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(Number(e.target.value))}
                  className="px-4 py-2.5 border rounded-xl text-sm font-bold bg-slate-50 focus:outline-none focus:border-violet-400"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                  ))}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  className="px-4 py-2.5 border rounded-xl text-sm font-bold bg-slate-50 focus:outline-none focus:border-violet-400"
                >
                  {[filterYear - 1, filterYear, filterYear + 1].map(y => (
                    <option key={y} value={y}>Năm {y}</option>
                  ))}
                </select>
                <button
                  onClick={fetchCurrentSalary}
                  className="px-4 py-2.5 bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold rounded-xl text-sm transition"
                >
                  🔄 Làm mới
                </button>
              </div>

              {/* Current month salary card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-slate-800 text-lg">Phiếu lương tháng {filterMonth}/{filterYear}</h3>
                  {currentMonthData && (
                    <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                      ✓ Đã tính toán
                    </span>
                  )}
                </div>

                {loadingSalary ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                  </div>
                ) : currentMonthData ? (
                  <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: "Số ca trực", value: currentMonthData.shifts, suffix: "ca", color: "text-slate-700" },
                        { label: "Giờ làm việc", value: currentMonthData.hours.toFixed(1), suffix: "giờ", color: "text-sky-600" },
                        { label: "Giờ quy đổi", value: currentMonthData.equivHours.toFixed(2), suffix: "giờ QĐ", color: "text-violet-600" },
                        { label: "Thực nhận", value: formatCurrency(currentMonthData.amount), suffix: "đ", color: "text-emerald-600", highlight: true },
                      ].map((stat, idx) => (
                        <div key={idx} className={`rounded-2xl p-4 text-center border ${stat.highlight ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                          <p className={`font-black text-xl mt-1 ${stat.color}`}>
                            {stat.value}
                            <span className="text-xs font-normal ml-0.5">{stat.suffix}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Difficult cases badge */}
                    {currentMonthData.difficulty > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-5 flex items-center gap-3">
                        <span className="text-xl">🦷</span>
                        <div>
                          <p className="text-xs font-bold text-red-400 uppercase">Ca khó trong tháng</p>
                          <p className="font-black text-red-600 text-lg">{Math.round(currentMonthData.difficulty / 0.2)} ca khó</p>
                          <p className="text-xs text-red-400">Hệ số cộng thêm: +{currentMonthData.difficulty.toFixed(2)}</p>
                        </div>
                      </div>
                    )}

                    {/* Shifts table */}
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-slate-50 text-xs font-bold text-slate-400 uppercase">
                            <th className="px-4 py-3.5">Ngày</th>
                            <th className="px-4 py-3.5">Ca &amp; Giờ</th>
                            <th className="px-4 py-3.5 text-center">Hệ số ca</th>
                            <th className="px-4 py-3.5 text-center">BN</th>
                            <th className="px-4 py-3.5 text-center">HS khó</th>
                            <th className="px-4 py-3.5 text-center">Giờ QĐ</th>
                            <th className="px-4 py-3.5 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMonthData.shiftDetails.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-10 text-slate-400 italic">
                                Không có ca trực nào trong tháng này.
                              </td>
                            </tr>
                          ) : (
                            currentMonthData.shiftDetails.map((s: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-50 hover:bg-violet-50/30 transition">
                                <td className="px-4 py-3.5">
                                  <p className="font-bold text-slate-700">{s.date}</p>
                                  <p className="text-xs text-slate-400">{getDayOfWeekLabel(s.date)}</p>
                                </td>
                                <td className="px-4 py-3.5">
                                  <p className="font-semibold text-slate-700">
                                    Ca {s.shiftType === "morning" ? "Sáng" : s.shiftType === "afternoon" ? "Chiều" : "Tối"}
                                  </p>
                                  <p className="text-xs text-slate-400">{s.startTime} - {s.endTime}</p>
                                </td>
                                <td className="px-4 py-3.5 text-center font-bold text-slate-700">{s.shiftMultiplier}</td>
                                <td className="px-4 py-3.5 text-center text-slate-600">{s.patientsCount}</td>
                                <td className="px-4 py-3.5 text-center">
                                  {s.totalDifficulty > 0 ? (
                                    <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">+{s.totalDifficulty}</span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3.5 text-center font-bold text-violet-600">{s.equivalentHours}</td>
                                <td className="px-4 py-3.5 text-right font-black text-emerald-600">
                                  {formatCurrency(s.shiftAmount)} đ
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="bg-violet-50 border-t-2 border-violet-200">
                            <td colSpan={5} className="px-4 py-3.5 font-black text-slate-700">Tổng cộng tháng</td>
                            <td className="px-4 py-3.5 text-center font-black text-violet-700">{currentMonthData.equivHours.toFixed(2)}</td>
                            <td className="px-4 py-3.5 text-right font-black text-emerald-700 text-lg">{formatCurrency(currentMonthData.amount)} đ</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-slate-500 font-semibold">Chưa có dữ liệu lương cho tháng này.</p>
                    <p className="text-slate-400 text-sm mt-1">Hãy chắc chắn bạn đã đăng ký ca trực và hoàn thành khám bệnh nhân.</p>
                  </div>
                )}
              </div>

              {/* Monthly history list */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-black text-slate-800 text-lg mb-4">📅 Lịch sử lương năm {filterYear}</h3>
                {loadingList ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                  </div>
                ) : monthlyList.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 italic">Chưa có bản ghi lương nào trong năm.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-xs font-bold text-slate-400 uppercase border-b">
                          <th className="px-4 py-3">Tháng</th>
                          <th className="px-4 py-3 text-center">Số ca</th>
                          <th className="px-4 py-3 text-center">Giờ QĐ</th>
                          <th className="px-4 py-3 text-center">Số ca khó</th>
                          <th className="px-4 py-3 text-right">Lương thực nhận</th>
                          <th className="px-4 py-3 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyList.map((record: any) => {
                          const diff = record.totalDifficulty || 0;
                          return (
                            <tr key={record._id || record.month} className="border-b border-slate-50 hover:bg-violet-50/30 transition">
                              <td className="px-4 py-3.5 font-bold text-slate-700">Tháng {record.month}/{record.year}</td>
                              <td className="px-4 py-3.5 text-center text-slate-600">{record.totalShifts || 0}</td>
                              <td className="px-4 py-3.5 text-center font-bold text-violet-500">{record.totalEquivalentHours?.toFixed(2) || 0}</td>
                              <td className="px-4 py-3.5 text-center">
                                {diff > 0 ? (
                                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-bold">{Math.round(diff / 0.2)} ca</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs font-bold">0 ca</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-right font-black text-emerald-600">
                                {formatCurrency(record.totalAmount || 0)} đ
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  record.status === "paid" ? "bg-emerald-50 text-emerald-600" :
                                  record.status === "approved" ? "bg-blue-50 text-blue-600" :
                                  record.status === "calculated" ? "bg-violet-50 text-violet-600" :
                                  "bg-slate-50 text-slate-500"
                                }`}>
                                  {record.status === "paid" ? "Đã thanh toán" :
                                   record.status === "approved" ? "Đã duyệt" :
                                   record.status === "calculated" ? "Đã tính" : "Nháp"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── YEARLY TAB ─── */}
          {activeTab === "yearly" && (
            <div className="space-y-6">
              {/* Year filter */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <span className="text-sm font-bold text-slate-500">Xem lương năm:</span>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  className="px-4 py-2.5 border rounded-xl text-sm font-bold bg-slate-50 focus:outline-none focus:border-violet-400"
                >
                  {[filterYear - 2, filterYear - 1, filterYear, filterYear + 1].map(y => (
                    <option key={y} value={y}>Năm {y}</option>
                  ))}
                </select>
                <button
                  onClick={fetchYearlyTrend}
                  className="px-4 py-2.5 bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold rounded-xl text-sm transition"
                >
                  🔄 Làm mới
                </button>
                {/* Yearly total */}
                {!loadingYearly && yearlyData.length > 0 && (
                  <div className="ml-auto bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-3">
                    <p className="text-xs font-bold text-emerald-400 uppercase">Tổng thu nhập năm</p>
                    <p className="font-black text-emerald-600 text-lg">
                      {formatCurrency(yearlyMapped.reduce((s, d) => s + d.amount, 0))} đ
                    </p>
                  </div>
                )}
              </div>

              {loadingYearly ? (
                <div className="flex justify-center items-center py-24">
                  <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Yearly chart */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-black text-slate-800 text-lg mb-4">📈 Xu hướng thu nhập năm {filterYear}</h3>
                    <div style={{ height: "280px" }}>
                      <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-5 mt-4 pt-4 border-t border-slate-100">
                      {[
                        { color: "bg-violet-500", label: "Thu nhập (VNĐ)" },
                        { color: "bg-sky-400", label: "Giờ làm việc" },
                        { color: "bg-red-400", label: "Số ca khó" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <span className={`w-3 h-3 rounded-full ${item.color} inline-block`}></span>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Yearly table */}
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h3 className="font-black text-slate-800 text-lg">Bảng lương 12 tháng năm {filterYear}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-slate-50 text-xs font-bold text-slate-400 uppercase">
                            <th className="px-4 py-3.5">Tháng</th>
                            <th className="px-4 py-3.5 text-center">Số ca</th>
                            <th className="px-4 py-3.5 text-center">Giờ làm việc</th>
                            <th className="px-4 py-3.5 text-center">Giờ quy đổi</th>
                            <th className="px-4 py-3.5 text-center">Số ca khó</th>
                            <th className="px-4 py-3.5 text-center">Tổng HS khó</th>
                            <th className="px-4 py-3.5 text-center">Hệ số lương</th>
                            <th className="px-4 py-3.5 text-right">Lương thực nhận</th>
                          </tr>
                        </thead>
                        <tbody>
                          {yearlyMapped.map((d) => (
                            <tr key={d.monthNum} className="border-b border-slate-50 hover:bg-violet-50/30 transition">
                              <td className="px-4 py-3.5 font-bold text-slate-700">{d.month}</td>
                              <td className="px-4 py-3.5 text-center text-slate-500">{d.shifts}</td>
                              <td className="px-4 py-3.5 text-center font-bold text-sky-600">{d.workingHours.toFixed(1)} giờ</td>
                              <td className="px-4 py-3.5 text-center font-bold text-violet-500">{d.equivHours.toFixed(2)}</td>
                              <td className="px-4 py-3.5 text-center">
                                {d.difficulty > 0 ? (
                                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-bold">{Math.round(d.difficulty / 0.2)} ca</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs font-bold">0 ca</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-center font-bold text-orange-500">{d.difficulty.toFixed(2)}</td>
                              <td className="px-4 py-3.5 text-center">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black">{userCoeff.toFixed(1)}</span>
                              </td>
                              <td className="px-4 py-3.5 text-right font-black text-emerald-600">{formatCurrency(d.amount)} đ</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-violet-50 border-t-2 border-violet-200">
                            <td className="px-4 py-3.5 font-black text-slate-700">Tổng cả năm</td>
                            <td className="px-4 py-3.5 text-center font-black text-slate-700">
                              {yearlyMapped.reduce((s, d) => s + d.shifts, 0)}
                            </td>
                            <td className="px-4 py-3.5 text-center font-black text-sky-600">
                              {yearlyMapped.reduce((s, d) => s + d.workingHours, 0).toFixed(1)} giờ
                            </td>
                            <td className="px-4 py-3.5 text-center font-black text-violet-700">
                              {yearlyMapped.reduce((s, d) => s + d.equivHours, 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3.5 text-center font-black text-red-600">
                              {yearlyMapped.reduce((s, d) => s + (d.difficulty > 0 ? Math.round(d.difficulty / 0.2) : 0), 0)} ca
                            </td>
                            <td className="px-4 py-3.5 text-center font-black text-orange-600">
                              {yearlyMapped.reduce((s, d) => s + d.difficulty, 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3.5 text-center font-black text-indigo-700">
                              <span className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded-lg text-xs font-black">{userCoeff.toFixed(1)}</span>
                            </td>
                            <td className="px-4 py-3.5 text-right font-black text-emerald-700 text-lg">
                              {formatCurrency(yearlyMapped.reduce((s, d) => s + d.amount, 0))} đ
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ─── Detail Modal (reuses same structure as AdminSalary) ─── */}
      {detailModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
              <div>
                <h2 className="font-black text-slate-800 text-lg">📋 Chi tiết lương tháng {filterMonth}/{filterYear}</h2>
                {detailModal.data && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    Bác sĩ: <span className="font-bold text-violet-600">{detailModal.data.salaryRecord?.doctorName}</span>
                    {" · "}
                    Học vị: <span className="font-bold text-slate-700">{userDegree}</span>
                    {" · "}
                    Hệ số lương: <span className="font-bold text-indigo-600">{userCoeff.toFixed(1)}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setDetailModal({ open: false, salaryId: null, data: null, loading: false })}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 flex items-center justify-center font-bold text-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {detailModal.loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-10 h-10 border-4 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                </div>
              ) : detailModal.data ? (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Giờ làm việc", value: detailModal.data.totalWorkingHours.toFixed(1), suffix: "giờ", color: "text-sky-600", bg: "bg-sky-50 border-sky-100" },
                      { label: "Số ca khó", value: detailModal.data.hardCasesCount.toString(), suffix: "ca", color: "text-red-600", bg: "bg-red-50 border-red-100" },
                      { label: "BN khó", value: detailModal.data.hardPatientsCount.toString(), suffix: "bệnh nhân", color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
                      { label: "Doanh thu tháng", value: detailModal.data.totalRevenue.toLocaleString("vi-VN"), suffix: "đ", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                    ].map((stat, idx) => (
                      <div key={idx} className={`rounded-2xl p-4 border text-center ${stat.bg}`}>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className={`font-black text-2xl mt-1 ${stat.color}`}>
                          {stat.value}<span className="text-xs font-normal ml-0.5">{stat.suffix}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Shifts + Doughnut chart side by side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Shifts table */}
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b">
                        <h4 className="font-bold text-slate-700 text-sm">📅 Chi tiết từng ca</h4>
                      </div>
                      <div className="overflow-y-auto max-h-72">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr className="text-slate-400 font-bold uppercase text-[10px]">
                              <th className="px-3 py-2 text-left">Ngày</th>
                              <th className="px-3 py-2 text-center">Ca</th>
                              <th className="px-3 py-2 text-center">Giờ</th>
                              <th className="px-3 py-2 text-center">BN</th>
                              <th className="px-3 py-2 text-center">HS khó</th>
                              <th className="px-3 py-2 text-center">Giờ QĐ</th>
                              <th className="px-3 py-2 text-right">Tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailModal.data.enrichedShiftDetails.map((shift: any) => (
                              <tr key={shift._id} className="border-b border-slate-50 hover:bg-violet-50/30">
                                <td className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">{shift.date}</td>
                                <td className="px-3 py-2 text-center">{getShiftBadge(shift.shiftType, shift.isWeekend)}</td>
                                <td className="px-3 py-2 text-center font-semibold">{shift.workingHours.toFixed(1)}</td>
                                <td className="px-3 py-2 text-center text-slate-500">{shift.patientsCount}</td>
                                <td className="px-3 py-2 text-center">
                                  {shift.totalDifficulty > 0
                                    ? <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold">{shift.totalDifficulty.toFixed(2)}</span>
                                    : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="px-3 py-2 text-center font-bold text-violet-500">{shift.equivalentHours.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right font-bold text-emerald-600">{shift.shiftAmount.toLocaleString("vi-VN")} đ</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Doughnut chart */}
                    <div className="border border-slate-100 rounded-2xl p-4">
                      <h4 className="font-bold text-slate-700 text-sm mb-4">📊 Phân bố mức độ khó ca khám</h4>
                      <div style={{ height: "220px" }}>
                        {detailModal.data.hardPatientsCount > 0 ? (
                          <Doughnut
                            data={{
                              labels: ["Thông thường", "Trung bình", "Phức tạp", "Khó nhất"],
                              datasets: [{
                                data: [
                                  detailModal.data.enrichedShiftDetails.reduce((s: number, sh: any) => s + sh.appointments.filter((a: any) => a.difficulty === 0).length, 0),
                                  detailModal.data.enrichedShiftDetails.reduce((s: number, sh: any) => s + sh.appointments.filter((a: any) => a.difficulty === 0.2).length, 0),
                                  detailModal.data.enrichedShiftDetails.reduce((s: number, sh: any) => s + sh.appointments.filter((a: any) => a.difficulty === 0.3).length, 0),
                                  detailModal.data.enrichedShiftDetails.reduce((s: number, sh: any) => s + sh.appointments.filter((a: any) => a.difficulty === 0.5).length, 0),
                                ],
                                backgroundColor: ["#e2e8f0", "#fde68a", "#fed7aa", "#fecaca"],
                                borderColor: ["#94a3b8", "#f59e0b", "#f97316", "#ef4444"],
                                borderWidth: 2,
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { position: "bottom", labels: { font: { size: 12 }, padding: 16 } },
                                tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} bệnh nhân` } }
                              },
                              cutout: "55%",
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <span className="text-4xl">📭</span>
                            <p className="text-sm font-semibold mt-2">Không có dữ liệu ca khó</p>
                          </div>
                        )}
                      </div>
                      {/* Legend */}
                      <div className="mt-4 pt-4 border-t space-y-2">
                        {[
                          { label: "Khó nhất (0.5)", color: "bg-red-100 text-red-700", count: detailModal.data.enrichedShiftDetails.reduce((s: number, sh: any) => s + sh.appointments.filter((a: any) => a.difficulty === 0.5).length, 0) },
                          { label: "Phức tạp (0.3)", color: "bg-orange-100 text-orange-700", count: detailModal.data.enrichedShiftDetails.reduce((s: number, sh: any) => s + sh.appointments.filter((a: any) => a.difficulty === 0.3).length, 0) },
                          { label: "Trung bình (0.2)", color: "bg-yellow-100 text-yellow-700", count: detailModal.data.enrichedShiftDetails.reduce((s: number, sh: any) => s + sh.appointments.filter((a: any) => a.difficulty === 0.2).length, 0) },
                          { label: "Thông thường (0.0)", color: "bg-gray-100 text-gray-500", count: detailModal.data.enrichedShiftDetails.reduce((s: number, sh: any) => s + sh.appointments.filter((a: any) => a.difficulty === 0).length, 0) },
                        ].map((item) => (
                          <div key={item.label} className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.color}`}>{item.label}</span>
                            <span className="font-bold text-slate-700 text-sm">{item.count} bệnh nhân</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Patient details */}
                  {detailModal.data.enrichedShiftDetails.some((sh: any) => sh.appointments.length > 0) && (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b">
                        <h4 className="font-bold text-slate-700 text-sm">🦷 Chi tiết bệnh nhân đã khám</h4>
                      </div>
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50">
                          <tr className="text-slate-400 font-bold uppercase text-[10px]">
                            <th className="px-3 py-2 text-left">Ngày</th>
                            <th className="px-3 py-2 text-left">Ca</th>
                            <th className="px-3 py-2 text-left">Bệnh nhân</th>
                            <th className="px-3 py-2 text-left">Dịch vụ</th>
                            <th className="px-3 py-2 text-center">Độ khó</th>
                            <th className="px-3 py-2 text-right">Phí khám</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailModal.data.enrichedShiftDetails.flatMap((shift: any) =>
                            shift.appointments.map((apt: any) => (
                              <tr key={apt._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                <td className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">{shift.date}</td>
                                <td className="px-3 py-2">{getShiftBadge(shift.shiftType, shift.isWeekend)}</td>
                                <td className="px-3 py-2 font-semibold text-slate-700">{apt.patientName}</td>
                                <td className="px-3 py-2 text-slate-500">{apt.serviceName}</td>
                                <td className="px-3 py-2 text-center">{getDifficultyBadge(apt.difficulty)}</td>
                                <td className="px-3 py-2 text-right font-bold text-emerald-600">
                                  {apt.fee > 0 ? `${apt.fee.toLocaleString("vi-VN")} đ` : <span className="text-slate-300">-</span>}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Total summary */}
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5">
                    <h4 className="font-bold text-slate-700 text-sm mb-4">💰 Tổng kết lương tháng</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Hệ số bằng cấp</p>
                        <p className="font-black text-violet-700 text-lg mt-0.5">{userCoeff.toFixed(1)} ({userDegree})</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Đơn giá/giờ</p>
                        <p className="font-black text-slate-700 text-lg mt-0.5">{basicHourlyRate.toLocaleString("vi-VN")} đ</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Tổng giờ QĐ</p>
                        <p className="font-black text-sky-700 text-lg mt-0.5">{detailModal.data.salaryRecord?.totalEquivalentHours?.toFixed(2) || 0} giờ</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Tổng lương</p>
                        <p className="font-black text-emerald-700 text-2xl mt-0.5">{detailModal.data.salaryRecord?.totalAmount?.toLocaleString("vi-VN") || 0} đ</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-violet-200">
                      <p className="text-xs text-slate-500">
                        <strong>Công thức:</strong> Lương = Giờ quy đổi × Hệ số bằng cấp × Đơn giá
                        <br />Giờ quy đổi = Giờ làm × (Hệ số ca + Tổng hệ số độ khó)
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 italic">Không có dữ liệu chi tiết.</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
              <button
                onClick={() => setDetailModal({ open: false, salaryId: null, data: null, loading: false })}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
