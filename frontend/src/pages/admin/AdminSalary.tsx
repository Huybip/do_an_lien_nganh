import { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { doctorApi, salaryApi, shiftApi, unwrap } from "../../services/api";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Types
interface PatientCase {
  name: string;
  code: string;
  difficulty: number;
}

interface MappedSession {
  id: string;
  date: string;
  shiftName: string;
  shiftMultiplier: number;
  patients: any[];
  totalDifficulty: number;
  equivalentHours: number;
  amount: number;
}

interface DoctorDegreeMap {
  [doctorId: string]: string;
}

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

export default function AdminSalary() {
  const [activeMenu, setActiveMenu] = useState<string>("uc4_4");
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // --- Configuration states ---
  const [basicHourlyRate, setBasicHourlyRate] = useState<number>(210000);
  const [degreeCoefficients, setDegreeCoefficients] = useState<Record<string, number>>({
    "Đại học": 1.2,
    "Thạc sỹ": 1.5,
    "Tiến sỹ": 2.0,
    "Phó giáo sư": 2.5,
    "Giáo sư": 3.0,
  });
  const [shiftMultipliers, setShiftMultipliers] = useState<Record<string, number>>({
    "weekday-morning": 1.0,
    "weekday-afternoon": 1.0,
    "weekday-evening": 1.2,
    "weekend-morning": 1.5,
    "weekend-afternoon": 1.5,
    "weekend-evening": 1.5,
  });
  const [difficultyCoefficients, setDifficultyCoefficients] = useState<Record<string, number>>({
    "Thông thường": 0.0,
    "Trung bình": 0.2,
    "Phức tạp": 0.3,
    "Khó nhất": 0.5,
  });

  const [doctorDegrees, setDoctorDegrees] = useState<DoctorDegreeMap>({});

  // Backend dynamic state variables
  const [activeSalary, setActiveSalary] = useState<any>(null);
  const [loadingSalary, setLoadingSalary] = useState<boolean>(false);
  const [allSalaries, setAllSalaries] = useState<any[]>([]);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [yearlyTrendData, setYearlyTrendData] = useState<any[]>([]);
  const [loadingYearly, setLoadingYearly] = useState<boolean>(false);
  const [allDoctorsYearly, setAllDoctorsYearly] = useState<any[]>([]);
  const [loadingYearlyAll, setLoadingYearlyAll] = useState<boolean>(false);

  // --- NEW: Salary Detail Modal (UC4.5) ---
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    salaryId: string | null;
    data: SalaryDetailModal | null;
    loading: boolean;
  }>({ open: false, salaryId: null, data: null, loading: false });

  // Local state for adding/calculating session
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [sessionStartHour, setSessionStartHour] = useState<number>(8);
  const [sessionEndHour, setSessionEndHour] = useState<number>(11);
  const [sessionShiftType, setSessionShiftType] = useState<string>("morning");
  const [sessionPatients, setSessionPatients] = useState<PatientCase[]>([
    { name: "Nguyễn Văn A", code: "BN001", difficulty: 0.0 },
  ]);

  // Filters for reports
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterDoctorId, setFilterDoctorId] = useState<string>("");

  // Load configuration from localStorage
  useEffect(() => {
    const savedRate = localStorage.getItem("salary_basic_hourly_rate");
    if (savedRate) setBasicHourlyRate(Number(savedRate));

    const savedDegrees = localStorage.getItem("salary_degree_coefficients");
    if (savedDegrees) setDegreeCoefficients(JSON.parse(savedDegrees));

    const savedShifts = localStorage.getItem("salary_shift_multipliers");
    if (savedShifts) setShiftMultipliers(JSON.parse(savedShifts));

    const savedDifficulties = localStorage.getItem("salary_difficulty_coefficients");
    if (savedDifficulties) setDifficultyCoefficients(JSON.parse(savedDifficulties));

    const savedDocDegrees = localStorage.getItem("salary_doctor_degrees");
    if (savedDocDegrees) setDoctorDegrees(JSON.parse(savedDocDegrees));
  }, []);

  // Fetch doctors list from API
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await doctorApi.getAll();
        const list = Array.isArray(res.data) ? res.data : [];
        setDoctorsList(list);
        if (list.length > 0) {
          setSelectedDoctorId(list[0].id || list[0]._id);
          setFilterDoctorId(list[0].id || list[0]._id);

          const updatedDocDegrees = { ...doctorDegrees };
          let changed = false;
          list.forEach((doc) => {
            const id = doc.id || doc._id;
            const dbDegree = doc.degree || "Đại học";
            if (updatedDocDegrees[id] !== dbDegree) {
              updatedDocDegrees[id] = dbDegree;
              changed = true;
            }
          });
          if (changed) {
            setDoctorDegrees(updatedDocDegrees);
          }
        }
      } catch (err) {
        console.error("Error loading doctors:", err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // --- API calling functions ---
  const fetchActiveSalary = async (docId: string, month: number, year: number) => {
    if (!docId) return;
    setLoadingSalary(true);
    try {
      const degree = doctorDegrees[docId] || "Đại học";
      const docCoeff = degreeCoefficients[degree] || 1.2;
      const res = await salaryApi.calculate({
        doctorId: docId,
        month,
        year,
        basicHourlyRate,
        degreeCoefficient: docCoeff,
      });
      setActiveSalary(unwrap(res));
    } catch (err) {
      console.error("Error calculating active salary:", err);
      setActiveSalary(null);
    } finally {
      setLoadingSalary(false);
    }
  };

  const fetchMonthlySummary = async (month: number, year: number) => {
    setLoadingSummary(true);
    try {
      const res = await salaryApi.list({ month, year, limit: 1000 });
      const records = unwrap<any[]>(res);
      const mapped = doctorsList.map((doc) => {
        const docId = doc.id || doc._id;
        const record = records.find((r: any) => {
          const rDocId = r.doctorId?._id || r.doctorId || "";
          return rDocId === docId;
        });
        if (record) {
          return record;
        } else {
          const degree = doctorDegrees[docId] || "Đại học";
          return {
            _id: null,
            doctorId: docId,
            doctorName: doc.name,
            doctorDegree: degree,
            month,
            year,
            totalShifts: 0,
            totalEquivalentHours: 0,
            totalAmount: 0,
            status: "draft"
          };
        }
      });
      setAllSalaries(mapped);
    } catch (err) {
      console.error("Error fetching monthly summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // --- NEW: Fetch salary detail for modal (UC4.5) ---
  const fetchSalaryDetail = async (salaryId: string) => {
    setDetailModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await salaryApi.getDetail(salaryId);
      setDetailModal(prev => ({ ...prev, data: unwrap(res), loading: false }));
    } catch (err) {
      console.error("Error fetching salary detail:", err);
      setDetailModal(prev => ({ ...prev, data: null, loading: false }));
    }
  };

  const handleOpenDetailModal = async (salaryRecord: any) => {
    const salaryId = salaryRecord._id;
    if (!salaryId) {
      alert("Bản ghi lương chưa được tính toán. Vui lòng đồng bộ trước!");
      return;
    }
    setDetailModal({ open: true, salaryId, data: null, loading: true });
    await fetchSalaryDetail(salaryId);
  };

  const handleCloseDetailModal = () => {
    setDetailModal({ open: false, salaryId: null, data: null, loading: false });
  };

  const handleSyncMonthlySummary = async () => {
    setLoadingSummary(true);
    try {
      const syncedSalaries = [];
      for (const doc of doctorsList) {
        const docId = doc.id || doc._id;
        const degree = doctorDegrees[docId] || "Đại học";
        const docCoeff = degreeCoefficients[degree] || 1.2;
        try {
          const res = await salaryApi.calculate({
            doctorId: docId,
            month: filterMonth,
            year: filterYear,
            basicHourlyRate,
            degreeCoefficient: docCoeff,
          });
          syncedSalaries.push(unwrap(res));
        } catch (err) {
          syncedSalaries.push({
            _id: null,
            doctorId: docId,
            doctorName: doc.name,
            doctorDegree: degree,
            month: filterMonth,
            year: filterYear,
            totalShifts: 0,
            totalEquivalentHours: 0,
            totalAmount: 0,
            status: "draft"
          });
        }
      }
      setAllSalaries(syncedSalaries);
      alert("Đồng bộ dữ liệu lương tháng thành công!");
    } catch (err) {
      console.error("Error syncing monthly summary:", err);
      alert("Có lỗi xảy ra khi đồng bộ!");
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchYearlyTrend = async (docId: string, year: number) => {
    if (!docId) return;
    setLoadingYearly(true);
    try {
      const degree = doctorDegrees[docId] || "Đại học";
      const docCoeff = degreeCoefficients[degree] || 1.2;
      const monthlyTrends = await Promise.all(
        Array.from({ length: 12 }, async (_, idx) => {
          const month = idx + 1;
          try {
            const res = await salaryApi.calculate({
              doctorId: docId,
              month,
              year,
              basicHourlyRate,
              degreeCoefficient: docCoeff,
            });
            const data = unwrap(res);
            return { ...data, month };
          } catch (err) {
            return {
              month,
              totalShifts: 0,
              totalEquivalentHours: 0,
              totalAmount: 0,
              totalWorkingHours: 0,
              totalDifficulty: 0,
            };
          }
        })
      );
      setYearlyTrendData(monthlyTrends);
    } catch (err) {
      console.error("Error fetching yearly trend:", err);
    } finally {
      setLoadingYearly(false);
    }
  };

  const fetchYearlyAllDoctors = async (year: number) => {
    setLoadingYearlyAll(true);
    try {
      const res = await salaryApi.list({ year, limit: 1000 });
      const records = unwrap<any[]>(res);
      const grouped = doctorsList.map((doc) => {
        const id = doc.id || doc._id;
        const degree = doctorDegrees[id] || "Đại học";
        const docCoeff = degreeCoefficients[degree] || 1.2;
        const docRecords = records.filter((r: any) => {
          const rDocId = r.doctorId?._id || r.doctorId || "";
          return rDocId === id;
        });
        const totalAmount = docRecords.reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0);
        return {
          name: doc.name,
          degree,
          docCoeff,
          totalAmount
        };
      });
      setAllDoctorsYearly(grouped);
    } catch (err) {
      console.error("Error fetching yearly all doctors:", err);
    } finally {
      setLoadingYearlyAll(false);
    }
  };

  const syncYearlyAllDoctors = async (year: number) => {
    setLoadingYearlyAll(true);
    try {
      for (const doc of doctorsList) {
        const id = doc.id || doc._id;
        const degree = doctorDegrees[id] || "Đại học";
        const docCoeff = degreeCoefficients[degree] || 1.2;
        for (let month = 1; month <= 12; month++) {
          try {
            await salaryApi.calculate({
              doctorId: id,
              month,
              year,
              basicHourlyRate,
              degreeCoefficient: docCoeff,
            });
          } catch (err) {
            // ignore
          }
        }
      }
      await fetchYearlyAllDoctors(year);
      alert("Đồng bộ và tính toán lại lương cả năm thành công!");
    } catch (err) {
      console.error("Error syncing yearly all doctors:", err);
    } finally {
      setLoadingYearlyAll(false);
    }
  };

  // Trigger loaders when active tab or filters change
  useEffect(() => {
    if (doctorsList.length === 0) return;

    if (activeMenu === "uc4_4") {
      fetchActiveSalary(filterDoctorId, filterMonth, filterYear);
    } else if (activeMenu === "uc4_5") {
      fetchMonthlySummary(filterMonth, filterYear);
    } else if (activeMenu === "uc4_6") {
      fetchYearlyTrend(filterDoctorId, filterYear);
    } else if (activeMenu === "uc4_7") {
      fetchYearlyAllDoctors(filterYear);
    }
  }, [activeMenu, filterDoctorId, filterMonth, filterYear, doctorsList]);

  const getDayOfWeekLabel = (dateString: string): string => {
    const date = new Date(dateString).getDay();
    const labels = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return labels[date];
  };

  // Save configurations
  const handleSaveHourlyRate = (rate: number) => {
    setBasicHourlyRate(rate);
    localStorage.setItem("salary_basic_hourly_rate", String(rate));
    alert("Đã lưu đơn giá cơ bản một giờ làm việc!");
    if (filterDoctorId) {
      fetchActiveSalary(filterDoctorId, filterMonth, filterYear);
    }
  };

  const handleSaveDegrees = () => {
    localStorage.setItem("salary_degree_coefficients", JSON.stringify(degreeCoefficients));
    alert("Đã lưu hệ số bằng cấp bác sĩ!");
    if (filterDoctorId) {
      fetchActiveSalary(filterDoctorId, filterMonth, filterYear);
    }
  };

  const handleSaveShifts = () => {
    localStorage.setItem("salary_shift_multipliers", JSON.stringify(shiftMultipliers));
    alert("Đã lưu hệ số ca làm việc!");
    if (filterDoctorId) {
      fetchActiveSalary(filterDoctorId, filterMonth, filterYear);
    }
  };

  const handleSaveDifficulties = () => {
    localStorage.setItem("salary_difficulty_coefficients", JSON.stringify(difficultyCoefficients));
    alert("Đã lưu hệ số mức độ khó của bệnh nhân!");
    if (filterDoctorId) {
      fetchActiveSalary(filterDoctorId, filterMonth, filterYear);
    }
  };

  const handleDoctorDegreeChange = async (docId: string, degree: string) => {
    const updated = { ...doctorDegrees, [docId]: degree };
    setDoctorDegrees(updated);

    try {
      await doctorApi.update(docId, { degree });
    } catch (e) {
      console.error("Failed to update degree in backend:", e);
    }

    if (docId === filterDoctorId) {
      const docCoeff = degreeCoefficients[degree] || 1.2;
      salaryApi.calculate({
        doctorId: docId,
        month: filterMonth,
        year: filterYear,
        basicHourlyRate,
        degreeCoefficient: docCoeff,
      }).then((res) => {
        setActiveSalary(unwrap(res));
      }).catch(err => console.error(err));
    }
  };

  const addPatientRow = () => {
    setSessionPatients([...sessionPatients, { name: "", code: "", difficulty: 0.0 }]);
  };

  const removePatientRow = (idx: number) => {
    const list = [...sessionPatients];
    list.splice(idx, 1);
    setSessionPatients(list);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      alert("Vui lòng chọn bác sĩ!");
      return;
    }

    const hours = sessionEndHour - sessionStartHour;
    if (hours <= 0) {
      alert("Giờ kết thúc phải lớn hơn giờ bắt đầu!");
      return;
    }

    setLoadingSalary(true);
    try {
      const startStr = `${String(sessionStartHour).padStart(2, "0")}:00`;
      const endStr = `${String(sessionEndHour).padStart(2, "0")}:00`;

      await shiftApi.create({
        doctorId: selectedDoctorId,
        date: sessionDate,
        shiftType: sessionShiftType,
        startTime: startStr,
        endTime: endStr,
        maxPatients: 10,
        notes: "Ca trực được tạo từ quản lý lương"
      });

      const validPatients = sessionPatients.filter(p => p.name.trim() !== "");
      if (validPatients.length > 0) {
        const { patientApi, appointmentApi } = await import("../../services/api");
        const patientsRes = await patientApi.getAll();
        const patientsList = Array.isArray(patientsRes.data) ? patientsRes.data : (Array.isArray(patientsRes) ? patientsRes : []);
        const dummyPatient = patientsList[0];
        const dummyPatientId = dummyPatient?.id || dummyPatient?._id;

        if (dummyPatientId) {
          for (const pat of validPatients) {
            const aptRes = await appointmentApi.create({
              doctorId: selectedDoctorId,
              patientId: dummyPatientId,
              date: sessionDate,
              shiftType: sessionShiftType,
              serviceName: "Khám điều trị",
              notes: `Bệnh nhân: ${pat.name}`
            });
            const createdApt = aptRes.data?.data || aptRes.data;
            if (createdApt && createdApt.id) {
              try {
                await appointmentApi.approve(createdApt.id);
              } catch (e) {}
              await appointmentApi.complete(createdApt.id, {
                notes: `Hoàn tất khám bệnh nhân ${pat.name}`,
                difficulty: pat.difficulty
              });
            }
          }
        }
      }

      alert("Đã thêm ca trực và ca khám thực tế thành công!");

      setSessionPatients([{ name: "", code: "", difficulty: 0.0 }]);

      if (selectedDoctorId === filterDoctorId) {
        fetchActiveSalary(filterDoctorId, filterMonth, filterYear);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Không thể lưu ca làm việc thực tế.");
    } finally {
      setLoadingSalary(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ca làm việc này khỏi lịch trực?")) {
      try {
        await shiftApi.delete(id);
        alert("Đã xóa ca làm việc!");
        if (filterDoctorId) {
          fetchActiveSalary(filterDoctorId, filterMonth, filterYear);
        }
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || err.message || "Không thể xóa ca làm việc.");
      }
    }
  };

  // --- Mapped variables for rendering logic compatibility ---
  const activeDoctorInfo = doctorsList.find(d => (d.id || d._id) === filterDoctorId);
  const activeDoctorDegree = filterDoctorId ? doctorDegrees[filterDoctorId] || "Đại học" : "Đại học";
  const activeDoctorMultiplier = degreeCoefficients[activeDoctorDegree] || 1.2;

  // Slip table sessions mapping
  const doctorMonthlySessions: MappedSession[] = (activeSalary?.shiftDetails || []).map((s: any) => ({
    id: s._id || s.id,
    date: s.date,
    shiftName: `Ca ${s.shiftType === "morning" ? "Sáng" : (s.shiftType === "afternoon" ? "Chiều" : "Tối")} (${s.startTime}-${s.endTime})`,
    shiftMultiplier: s.shiftMultiplier,
    patients: Array.from({ length: s.patientsCount || 0 }),
    totalDifficulty: s.totalDifficulty,
    equivalentHours: s.equivalentHours,
    amount: s.shiftAmount
  }));

  // Slip summary mapping
  const doctorMonthlySummary = {
    shifts: activeSalary?.totalShifts || 0,
    hours: activeSalary?.totalWorkingHours || 0,
    equivHours: activeSalary?.totalEquivalentHours || 0,
    totalAmount: activeSalary?.totalAmount || 0
  };

  // All Doctors monthly summary (UC4.5) - with salary ID for modal drill-down
  const allDoctorsMonthlySummary = allSalaries.map((s: any) => {
    const docId = s.doctorId?._id || s.doctorId || "";
    return {
      _id: s._id || null,
      id: docId,
      name: s.doctorName,
      code: docId.slice(-5).toUpperCase(),
      degree: s.doctorDegree || doctorDegrees[docId] || "Đại học",
      shifts: s.totalShifts || 0,
      workingHours: s.totalWorkingHours || 0,
      equivHours: s.totalEquivalentHours || 0,
      totalDifficulty: s.totalDifficulty || 0,
      totalAmount: s.totalAmount || 0,
    };
  });

  // Yearly trend data for 1 Doctor (UC4.6) - with working hours & difficulty
  const doctorYearlyData = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const record = yearlyTrendData.find((r: any) => r.month === m);
    return {
      month: `Tháng ${m}`,
      shifts: record?.totalShifts || 0,
      workingHours: record?.totalWorkingHours || 0,
      equivHours: record?.totalEquivalentHours || 0,
      difficulty: record?.totalDifficulty || 0,
      amount: record?.totalAmount || 0
    };
  });

  // All Doctors yearly summary (UC4.7)
  const allDoctorsYearlySummary = allDoctorsYearly;

  // --- Chart configs ---
  const lineChartData = {
    labels: doctorYearlyData.map(d => d.month),
    datasets: [
      {
        label: `Thu nhập năm ${filterYear} (VNĐ)`,
        data: doctorYearlyData.map(d => d.amount),
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.08)",
        borderColor: "#6366f1",
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: "#4f46e5",
        pointHoverRadius: 8,
        pointRadius: 5
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
            const rec = doctorYearlyData[ctx.dataIndex];
            return [
              ` Thu nhập: ${rec.amount.toLocaleString("vi-VN")} đ`,
              ` Giờ làm việc: ${rec.workingHours.toFixed(1)} giờ`,
              ` Số ca khó: ${rec.difficulty > 0 ? Math.round(rec.difficulty / 0.2) : 0} ca`,
              ` Hệ số lương: ${activeDoctorMultiplier.toFixed(1)}`,
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

  const barChartData = {
    labels: allDoctorsYearlySummary.map(d => d.name),
    datasets: [
      {
        label: `Tổng thu nhập năm ${filterYear} (VNĐ)`,
        data: allDoctorsYearlySummary.map(d => d.totalAmount),
        backgroundColor: [
          "rgba(14, 165, 233, 0.85)",
          "rgba(16, 185, 129, 0.85)",
          "rgba(139, 92, 246, 0.85)",
          "rgba(245, 158, 11, 0.85)",
        ],
        borderRadius: 10,
        maxBarThickness: 50
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const rec = allDoctorsYearlySummary[ctx.dataIndex];
            return [
              ` Tổng thu nhập: ${rec.totalAmount.toLocaleString("vi-VN")} đ`,
              ` Hệ số lương: ${rec.docCoeff?.toFixed(1) || "N/A"}`,
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

  const handlePrintSlip = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Phiếu Lương Bác Sĩ - Phòng Khám VinaMec</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #334155; }
            .header { text-align: center; margin-bottom: 30px; }
            h2 { color: #0f172a; margin-bottom: 5px; }
            .subtitle { color: #64748b; font-size: 14px; margin-bottom: 20px; }
            .meta-table, .detail-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .meta-table td { padding: 8px 0; font-size: 14px; }
            .detail-table th, .detail-table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
            .total-row { font-weight: bold; background-color: #f1f5f9; }
            .formula-info { margin-top: 30px; font-size: 12px; color: #64748b; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PHÒNG KHÁM NHA KHOA VINAMEC</h2>
            <div class="subtitle">PHIẾU CHI TRẢ LƯƠNG BÁC SĨ (THÁNG ${filterMonth}/${filterYear})</div>
          </div>
          <table class="meta-table">
            <tr>
              <td><strong>Họ và tên bác sĩ:</strong> Dr. ${activeDoctorInfo?.name || "Chưa chọn"}</td>
              <td><strong>Bằng cấp/Học hàm:</strong> ${activeDoctorDegree} (Hệ số: ${activeDoctorMultiplier})</td>
            </tr>
            <tr>
              <td><strong>Đơn giá giờ cơ bản:</strong> ${basicHourlyRate.toLocaleString("vi-VN")} đ/giờ</td>
              <td><strong>Thời gian lập:</strong> ${new Date().toLocaleDateString("vi-VN")}</td>
            </tr>
          </table>
          <hr/>
          <h3>CHI TIẾT CÁC CA LÀM VIỆC TRONG THÁNG</h3>
          <table class="detail-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Ca trực</th>
                <th>Thứ</th>
                <th>Hệ số ca</th>
                <th>Số BN</th>
                <th>Tổng HS độ khó</th>
                <th>Giờ QĐ</th>
                <th>Thành tiền (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              ${doctorMonthlySessions.map(s => `
                <tr>
                  <td>${s.date}</td>
                  <td>${s.shiftName}</td>
                  <td>${getDayOfWeekLabel(s.date)}</td>
                  <td>${s.shiftMultiplier}</td>
                  <td>${s.patients.length}</td>
                  <td>${s.totalDifficulty}</td>
                  <td>${s.equivalentHours}</td>
                  <td><strong>${s.amount.toLocaleString("vi-VN")} đ</strong></td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td colspan="3">Tổng cộng</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>${doctorMonthlySummary.equivHours.toFixed(2)}</td>
                <td>${doctorMonthlySummary.totalAmount.toLocaleString("vi-VN")} đ</td>
              </tr>
            </tbody>
          </table>

          <div class="formula-info">
            <strong>Công thức tính lương ca làm thêm tại Smart Dental:</strong><br/>
            - Tiền lương một ca = Số giờ quy đổi * Hệ số bằng cấp bác sĩ * Số tiền một giờ<br/>
            - Số giờ quy đổi = Số giờ mỗi ca * (Hệ số ca làm việc + Tổng hệ số độ khó bệnh nhân)
          </div>
          <script>window.print();<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // --- Sub-menu Navigation config ---
  const menuConfig = [
    {
      category: "Cấu hình lương",
      items: [
        { id: "uc4_1", label: "1. Mức lương một giờ" },
        { id: "uc4_2", label: "2. Hệ số ca các thứ" },
        { id: "uc4_3", label: "3. Hệ số độ khó bệnh nhân" },
      ]
    },
    {
      category: "Nghiệp vụ & Thống kê",
      items: [
        { id: "uc4_4", label: "4. Phiếu lương Bác sĩ" },
        { id: "uc4_5", label: "5. Báo cáo lương tháng" },
        { id: "uc4_6", label: "6. Thống kê năm của 1 BS" },
        { id: "uc4_7", label: "7. Thống kê năm tất cả BS" },
      ]
    }
  ];

  const hourlyRateBadge = (
    <div className="text-right bg-sky-50 border border-sky-100 rounded-xl px-4 py-1.5 flex-shrink-0 shadow-sm select-none">
      <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest leading-none">Đơn giá cơ bản</p>
      <p className="text-sm font-black text-sky-700 mt-1 leading-none">{basicHourlyRate.toLocaleString("vi-VN")} đ/h</p>
    </div>
  );

  // --- Difficulty badge helper ---
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

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0 flex flex-col">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý lương Bác sĩ</h1>
            <p className="text-sm text-slate-500 mt-0.5">Phòng khám nha khoa Smart Dental</p>
          </div>
        </div>

        {/* Master-Detail Page Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* LEFT SUBMENU PANEL */}
          <div className="w-full md:w-64 bg-white/60 backdrop-blur border-r border-slate-200/80 p-4 space-y-6">
            {menuConfig.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2.5">
                  {cat.category}
                </p>
                <div className="space-y-1">
                  {cat.items.map((item) => {
                    const isActive = activeMenu === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveMenu(item.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-between ${
                          isActive
                            ? "text-white shadow-md bg-gradient-to-r from-sky-500 to-blue-600"
                            : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-800"
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT DETAIL WORKSPACE */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">

            {/* UC4.1: Hourly wage setting */}
            {activeMenu === "uc4_1" && (
              <div className="card p-6 border border-slate-100 max-w-2xl space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-2xl shadow-lg">
                    💰
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Đơn giá cơ bản cho một giờ làm việc</h3>
                    <p className="text-xs text-slate-400">Thiết lập mức tiền cơ bản làm thêm cho 1 giờ (VNĐ)</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đơn giá hiện tại</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">
                    {basicHourlyRate.toLocaleString("vi-VN")}
                    <span className="text-lg font-bold ml-1">VNĐ/giờ</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Đơn giá mới (VNĐ)</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      defaultValue={basicHourlyRate}
                      id="input_basic_hourly_rate"
                      className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl text-base font-bold focus:outline-none focus:border-sky-500 transition"
                      placeholder="Ví dụ: 210000"
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById("input_basic_hourly_rate") as HTMLInputElement;
                        if (el && el.value) handleSaveHourlyRate(Number(el.value));
                      }}
                      className="px-6 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all duration-200"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* UC4.2: Day of week coefficients */}
            {activeMenu === "uc4_2" && (
              <div className="card p-6 border border-slate-100 max-w-5xl space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg">
                    📅
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Thiết lập hệ số ca làm việc</h3>
                    <p className="text-xs text-slate-400">Cấu hình hệ số ca làm việc các ngày trong tuần và cuối tuần</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 text-sm border-b pb-2 flex items-center gap-2">
                      <span>📆 Ngày trong tuần (Thứ 2 - Thứ 6)</span>
                    </h4>
                    <div className="space-y-3">
                      {["morning", "afternoon", "evening"].map((shift) => (
                        <div key={`weekday-${shift}`} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                          <span className="text-xs font-bold text-slate-600 uppercase">
                            Ca {shift === "morning" ? "Sáng" : (shift === "afternoon" ? "Chiều" : "Tối")}
                          </span>
                          <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="1.5"
                            value={shiftMultipliers[`weekday-${shift}`]}
                            onChange={(e) => setShiftMultipliers({ ...shiftMultipliers, [`weekday-${shift}`]: Number(e.target.value) })}
                            className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-center font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 text-sm border-b pb-2 flex items-center gap-2">
                      <span>🏖️ Ngày cuối tuần (Thứ 7 - Chủ Nhật)</span>
                    </h4>
                    <div className="space-y-3">
                      {["morning", "afternoon", "evening"].map((shift) => (
                        <div key={`weekend-${shift}`} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                          <span className="text-xs font-bold text-slate-600 uppercase">
                            Ca {shift === "morning" ? "Sáng" : (shift === "afternoon" ? "Chiều" : "Tối")}
                          </span>
                          <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="1.5"
                            value={shiftMultipliers[`weekend-${shift}`]}
                            onChange={(e) => setShiftMultipliers({ ...shiftMultipliers, [`weekend-${shift}`]: Number(e.target.value) })}
                            className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-center font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveShifts}
                    className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all"
                  >
                    Lưu cấu hình hệ số ca
                  </button>
                </div>
              </div>
            )}

            {/* UC4.3: Patient difficulty */}
            {activeMenu === "uc4_3" && (
              <div className="card p-6 border border-slate-100 max-w-2xl space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-2xl shadow-lg">
                    🦷
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Hệ số độ khó bệnh nhân</h3>
                    <p className="text-xs text-slate-400">Thiết lập hệ số cộng thêm cho các trường hợp xử lý phức tạp</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(difficultyCoefficients).map(([level, coeff]) => (
                    <div key={level} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                      <div>
                        <span className="font-bold text-slate-700 text-sm block">{level}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Mức độ điều trị</span>
                      </div>
                      <input
                        type="number"
                        step="0.05"
                        min="0.0"
                        max="0.5"
                        value={coeff}
                        onChange={(e) => setDifficultyCoefficients({ ...difficultyCoefficients, [level]: Number(e.target.value) })}
                        className="w-28 px-3 py-2 border border-slate-200 rounded-xl text-center font-bold text-base"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveDifficulties}
                    className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all"
                  >
                    Lưu cấu hình hệ số bệnh nhân
                  </button>
                </div>
              </div>
            )}

            {/* UC4.4: Salary Slip and Calculator */}
            {activeMenu === "uc4_4" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Salary Slip Generator (Left 3 cols on xl) */}
                <div className="lg:col-span-2 xl:col-span-3 space-y-6">
                  <div className="card p-6 border border-slate-100 space-y-5">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-bold text-slate-800 text-xl">Phiếu chi trả lương Bác sĩ</h3>
                          <p className="text-sm text-slate-500">Danh sách các ca trực và chi tiết tính lương</p>
                        </div>
                        {hourlyRateBadge}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={filterMonth}
                          onChange={(e) => setFilterMonth(Number(e.target.value))}
                          className="px-3.5 py-2.5 border rounded-xl text-sm font-bold bg-slate-50"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                          ))}
                        </select>
                        <select
                          value={filterDoctorId}
                          onChange={(e) => setFilterDoctorId(e.target.value)}
                          className="px-3.5 py-2.5 border rounded-xl text-sm font-bold bg-slate-50"
                        >
                          {doctorsList.map((d) => (
                            <option key={d.id || d._id} value={d.id || d._id}>Dr. {d.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={handlePrintSlip}
                          className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 border rounded-xl text-sm font-bold text-slate-700 transition"
                        >
                          🖨️ In phiếu lương
                        </button>
                      </div>
                    </div>

                    {/* Active Doctor profile card */}
                    {activeDoctorInfo && (
                      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-5 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-xs">Bác sĩ</p>
                          <p className="font-bold text-slate-700 text-base mt-0.5">Dr. {activeDoctorInfo.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Mã số: #{activeDoctorInfo.id?.slice(-6) || "BS"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-xs">Học hàm/Bằng cấp</p>
                          <select
                            value={activeDoctorDegree}
                            onChange={(e) => handleDoctorDegreeChange(activeDoctorInfo.id || activeDoctorInfo._id, e.target.value)}
                            className="mt-0.5 font-bold text-sky-700 bg-transparent border-b border-sky-300 focus:outline-none py-0.5 text-sm"
                          >
                            <option value="Đại học">Đại học (Hệ số: 1.2)</option>
                            <option value="Thạc sỹ">Thạc sỹ (Hệ số: 1.5)</option>
                            <option value="Tiến sỹ">Tiến sỹ (Hệ số: 2.0)</option>
                            <option value="Phó giáo sư">Phó giáo sư (Hệ số: 2.5)</option>
                            <option value="Giáo sư">Giáo sư (Hệ số: 3.0)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Summary row */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Tổng ca trực", value: doctorMonthlySummary.shifts, suffix: "ca", color: "text-slate-700 text-lg" },
                        { label: "Số giờ làm thêm", value: doctorMonthlySummary.equivHours.toFixed(2), suffix: "giờ QĐ", color: "text-sky-600 text-lg" },
                        { label: "Thực nhận", value: doctorMonthlySummary.totalAmount.toLocaleString("vi-VN"), suffix: "đ", color: "text-emerald-600 font-black text-2xl" }
                      ].map((sum, index) => (
                        <div key={index} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sum.label}</p>
                          <p className={`font-bold mt-1.5 ${sum.color}`}>
                            {sum.value}
                            <span className="text-sm font-normal ml-0.5">{sum.suffix}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Sessions Table */}
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                            <th className="px-4 py-3.5">Ngày</th>
                            <th className="px-4 py-3.5">Ca &amp; Giờ</th>
                            <th className="px-4 py-3.5 text-center">Hệ số ca</th>
                            <th className="px-4 py-3.5 text-center">Số BN</th>
                            <th className="px-4 py-3.5 text-center">HS khó</th>
                            <th className="px-4 py-3.5 text-center">Giờ QĐ</th>
                            <th className="px-4 py-3.5 text-right">Thành tiền</th>
                            <th className="px-4 py-3.5 text-center">Xóa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doctorMonthlySessions.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-10 text-slate-400 italic">
                                Không có ca làm thêm nào trong tháng này.
                              </td>
                            </tr>
                          ) : (
                            doctorMonthlySessions.map((s) => (
                              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-4 py-3.5 font-semibold text-slate-700">{s.date}</td>
                                <td className="px-4 py-3.5 text-slate-700">{s.shiftName}</td>
                                <td className="px-4 py-3.5 text-center font-semibold text-slate-700">{s.shiftMultiplier}</td>
                                <td className="px-4 py-3.5 text-center text-slate-600">{s.patients.length}</td>
                                <td className="px-4 py-3.5 text-center text-slate-600">{s.totalDifficulty}</td>
                                <td className="px-4 py-3.5 text-center font-bold text-sky-600">{s.equivalentHours}</td>
                                <td className="px-4 py-3.5 text-right font-bold text-slate-800">{s.amount.toLocaleString("vi-VN")} đ</td>
                                <td className="px-4 py-3.5 text-center">
                                  <button
                                    onClick={() => handleDeleteSession(s.id)}
                                    className="w-6.5 h-6.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center mx-auto transition"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Form to Add New Work Session */}
                <div className="space-y-6">
                  <form onSubmit={handleSaveSession} className="card p-6 border border-slate-100 space-y-4">
                    <div className="border-b pb-2">
                      <h4 className="font-bold text-slate-800 text-base">Thêm ca làm việc thực tế</h4>
                      <p className="text-xs text-slate-500">Tự nhập thông tin để tính tiền thanh toán ca</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Chọn Bác sĩ</label>
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500 bg-slate-50"
                        required
                      >
                        <option value="">Chọn bác sĩ...</option>
                        {doctorsList.map((d) => (
                          <option key={d.id || d._id} value={d.id || d._id}>
                            Dr. {d.name} ({doctorDegrees[d.id || d._id] || "Đại học"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ngày làm việc</label>
                        <input
                          type="date"
                          value={sessionDate}
                          onChange={(e) => setSessionDate(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500 bg-slate-50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phân loại ca</label>
                        <select
                          value={sessionShiftType}
                          onChange={(e) => setSessionShiftType(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500 bg-slate-50"
                        >
                          <option value="morning">Sáng (8h-12h)</option>
                          <option value="afternoon">Chiều (13h-17h)</option>
                          <option value="evening">Tối (18h-21h)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Giờ Bắt đầu</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={sessionStartHour}
                          onChange={(e) => setSessionStartHour(Number(e.target.value))}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500 text-center bg-slate-50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Giờ Kết thúc</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={sessionEndHour}
                          onChange={(e) => setSessionEndHour(Number(e.target.value))}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500 text-center bg-slate-50"
                          required
                        />
                      </div>
                    </div>

                    {/* Patient list row inputs */}
                    <div className="space-y-2 border-t pt-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Danh sách bệnh nhân</label>
                        <button
                          type="button"
                          onClick={addPatientRow}
                          className="text-xs font-bold text-sky-600 hover:text-sky-800"
                        >
                          + Thêm BN
                        </button>
                      </div>

                      {sessionPatients.map((pat, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                          <input
                            type="text"
                            placeholder="Tên BN"
                            value={pat.name}
                            onChange={(e) => {
                              const list = [...sessionPatients];
                              list[idx].name = e.target.value;
                              setSessionPatients(list);
                            }}
                            className="flex-1 px-2.5 py-1.5 border rounded text-xs focus:outline-none focus:border-sky-500"
                            required
                          />
                          <select
                            value={pat.difficulty}
                            onChange={(e) => {
                              const list = [...sessionPatients];
                              list[idx].difficulty = Number(e.target.value);
                              setSessionPatients(list);
                            }}
                            className="px-1 py-1.5 border rounded text-xs focus:outline-none"
                          >
                            <option value="0.0">Normal (0)</option>
                            <option value="0.2">Medium (0.2)</option>
                            <option value="0.3">Hard (0.3)</option>
                            <option value="0.5">Khó nhất (0.5)</option>
                          </select>
                          {sessionPatients.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePatientRow(idx)}
                              className="text-red-500 hover:text-red-700 font-bold text-sm px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={loadingSalary}
                      className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60"
                    >
                      {loadingSalary ? "Đang xử lý..." : "Lưu và cộng vào phiếu lương"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* UC4.5: Monthly Salary Report of all Doctors */}
            {activeMenu === "uc4_5" && (
              <div className="card p-6 border border-slate-100 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-xl">Báo cáo tiền lương tất cả bác sĩ</h3>
                      <p className="text-sm text-slate-500">Tổng hợp thu nhập thanh toán trong tháng — Nhấn vào bác sĩ để xem chi tiết</p>
                    </div>
                    {hourlyRateBadge}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(Number(e.target.value))}
                      className="px-3.5 py-2.5 border rounded-xl text-sm font-bold bg-slate-50"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                      ))}
                    </select>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(Number(e.target.value))}
                      className="px-3.5 py-2.5 border rounded-xl text-sm font-bold bg-slate-50"
                    >
                      {[filterYear - 2, filterYear - 1, filterYear, filterYear + 1].map(y => (
                        <option key={y} value={y}>Năm {y}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleSyncMonthlySummary}
                      className="px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-sm font-bold transition"
                      disabled={loadingSummary}
                    >
                      {loadingSummary ? "Đang xử lý..." : "🔄 Đồng bộ & Làm mới"}
                    </button>
                    <button
                      onClick={() => {
                        const csvContent = [
                          "BÁO CÁO TIỀN LƯƠNG TẤT CẢ BÁC SĨ THÁNG " + filterMonth + "/" + filterYear,
                          "Mã Bác sĩ,Họ tên,Học vị,Số ca trực,Giờ làm việc,Giờ quy đổi,Tổng HS độ khó,Thành tiền (VND)",
                          ...allDoctorsMonthlySummary.map(d => `${d.code},${d.name},${d.degree},${d.shifts},${d.workingHours.toFixed(1)},${d.equivHours},${d.totalDifficulty},${d.totalAmount}`)
                        ].join("\n");
                        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `luong-thang-${filterMonth}-${filterYear}.csv`;
                        a.click();
                      }}
                      className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold transition"
                    >
                      📥 Xuất CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  {loadingSummary ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="w-8 h-8 border-4 border-sky-500/30 border-t-sky-600 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-xs font-bold text-slate-500 uppercase">
                          <th className="px-4 py-4">Mã số</th>
                          <th className="px-4 py-4">Bác sĩ</th>
                          <th className="px-4 py-4">Học vị / Bằng cấp</th>
                          <th className="px-4 py-4 text-center">Hệ số lương</th>
                          <th className="px-4 py-4 text-center">Số ca làm</th>
                          <th className="px-4 py-4 text-center">Giờ làm việc</th>
                          <th className="px-4 py-4 text-center">Số ca khó</th>
                          <th className="px-4 py-4 text-center">Tổng HS độ khó</th>
                          <th className="px-4 py-4 text-right">Lương thực lĩnh (VNĐ)</th>
                          <th className="px-4 py-4 text-center">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allDoctorsMonthlySummary.map((d) => {
                          const degreeCoeff = degreeCoefficients[d.degree] || 1.2;
                          return (
                            <tr key={d.id} className="border-b border-slate-100 hover:bg-sky-50/40 cursor-pointer transition">
                              <td className="px-4 py-4 font-bold text-slate-400">#{d.code}</td>
                              <td className="px-4 py-4 font-bold text-slate-700">Dr. {d.name}</td>
                              <td className="px-4 py-4 font-semibold text-sky-600">{d.degree}</td>
                              <td className="px-4 py-4 text-center">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black">{degreeCoeff.toFixed(1)}</span>
                              </td>
                              <td className="px-4 py-4 text-center font-medium text-slate-600">{d.shifts}</td>
                              <td className="px-4 py-4 text-center font-bold text-slate-700">{d.workingHours.toFixed(1)}</td>
                              <td className="px-4 py-4 text-center">
                                {d.totalDifficulty > 0 ? (
                                  <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">{Math.round(d.totalDifficulty / 0.2)} ca</span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded-full text-xs font-bold">0 ca</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center font-bold text-orange-500">{d.totalDifficulty.toFixed(2)}</td>
                              <td className="px-4 py-4 text-right font-black text-emerald-600 text-lg">
                                {d.totalAmount.toLocaleString("vi-VN")} đ
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button
                                  onClick={() => handleOpenDetailModal(d as any)}
                                  className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg text-xs font-bold transition"
                                >
                                  📋 Xem chi tiết
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* UC4.6: Yearly Salary Report of 1 Doctor (with enhanced Chart + Table) */}
            {activeMenu === "uc4_6" && (
              <div className="card p-6 border border-slate-100 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-xl">Báo cáo tiền lương năm của Bác sĩ</h3>
                      <p className="text-sm text-slate-500">Biểu đồ doanh thu, giờ làm việc, ca khó và hệ số lương 12 tháng</p>
                    </div>
                    {hourlyRateBadge}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={filterDoctorId}
                      onChange={(e) => setFilterDoctorId(e.target.value)}
                      className="px-3.5 py-2.5 border rounded-xl text-sm font-bold bg-slate-50"
                    >
                      {doctorsList.map((d) => (
                        <option key={d.id || d._id} value={d.id || d._id}>Dr. {d.name}</option>
                      ))}
                    </select>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(Number(e.target.value))}
                      className="px-3.5 py-2.5 border rounded-xl text-sm font-bold bg-slate-50"
                    >
                      {[filterYear - 2, filterYear - 1, filterYear, filterYear + 1].map(y => (
                        <option key={y} value={y}>Năm {y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Doctor info card */}
                {activeDoctorInfo && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-indigo-400 font-semibold uppercase text-xs">Bác sĩ</p>
                      <p className="font-bold text-slate-700 mt-0.5">Dr. {activeDoctorInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-indigo-400 font-semibold uppercase text-xs">Học vị</p>
                      <p className="font-bold text-sky-700 mt-0.5">{activeDoctorDegree}</p>
                    </div>
                    <div>
                      <p className="text-indigo-400 font-semibold uppercase text-xs">Hệ số lương</p>
                      <p className="font-black text-2xl text-indigo-700 mt-0.5">{activeDoctorMultiplier.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-indigo-400 font-semibold uppercase text-xs">Đơn giá</p>
                      <p className="font-bold text-slate-700 mt-0.5">{basicHourlyRate.toLocaleString("vi-VN")} đ/h</p>
                    </div>
                  </div>
                )}

                {loadingYearly ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Enhanced Chart with hours, difficulty, and coefficient */}
                    <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-5">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                        Biểu đồ thu nhập &amp; giờ làm việc năm {filterYear}
                      </h4>
                      <div style={{ height: "280px" }}>
                        <Line data={lineChartData} options={lineChartOptions} />
                      </div>
                      {/* Legend */}
                      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
                          Thu nhập (VNĐ)
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <span className="w-3 h-3 rounded-full bg-sky-400 inline-block"></span>
                          Giờ làm việc
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                          Số ca khó
                        </div>
                      </div>
                    </div>

                    {/* Data Table with all metrics */}
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                            <th className="px-4 py-3">Tháng</th>
                            <th className="px-4 py-3 text-center">Số ca trực</th>
                            <th className="px-4 py-3 text-center">Giờ làm việc</th>
                            <th className="px-4 py-3 text-center">Giờ quy đổi</th>
                            <th className="px-4 py-3 text-center">Số ca khó</th>
                            <th className="px-4 py-3 text-center">Tổng HS độ khó</th>
                            <th className="px-4 py-3 text-center">Hệ số lương</th>
                            <th className="px-4 py-3 text-right">Lương thực lĩnh (VNĐ)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doctorYearlyData.map((d, index) => (
                            <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="px-4 py-3 font-bold text-slate-700">{d.month}</td>
                              <td className="px-4 py-3 text-center text-slate-500">{d.shifts}</td>
                              <td className="px-4 py-3 text-center font-bold text-sky-600">{d.workingHours.toFixed(1)} giờ</td>
                              <td className="px-4 py-3 text-center font-bold text-indigo-500">{d.equivHours.toFixed(2)}</td>
                              <td className="px-4 py-3 text-center">
                                {d.difficulty > 0 ? (
                                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-bold">{Math.round(d.difficulty / 0.2)} ca</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs font-bold">0 ca</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-orange-500">{d.difficulty.toFixed(2)}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black">{activeDoctorMultiplier.toFixed(1)}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-emerald-600">{d.amount.toLocaleString("vi-VN")} đ</td>
                            </tr>
                          ))}
                        </tbody>
                        {/* Yearly total row */}
                        <tfoot>
                          <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                            <td className="px-4 py-3.5 font-black text-slate-700">Tổng cả năm</td>
                            <td className="px-4 py-3.5 text-center font-black text-slate-700">
                              {doctorYearlyData.reduce((s, d) => s + d.shifts, 0)}
                            </td>
                            <td className="px-4 py-3.5 text-center font-black text-sky-600">
                              {doctorYearlyData.reduce((s, d) => s + d.workingHours, 0).toFixed(1)} giờ
                            </td>
                            <td className="px-4 py-3.5 text-center font-black text-indigo-600">
                              {doctorYearlyData.reduce((s, d) => s + d.equivHours, 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3.5 text-center font-black text-red-600">
                              {doctorYearlyData.reduce((s, d) => s + (d.difficulty > 0 ? Math.round(d.difficulty / 0.2) : 0), 0)} ca
                            </td>
                            <td className="px-4 py-3.5 text-center font-black text-orange-600">
                              {doctorYearlyData.reduce((s, d) => s + d.difficulty, 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3.5 text-center font-black text-indigo-700">
                              <span className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded-lg text-xs font-black">{activeDoctorMultiplier.toFixed(1)}</span>
                            </td>
                            <td className="px-4 py-3.5 text-right font-black text-emerald-700 text-lg">
                              {doctorYearlyData.reduce((s, d) => s + d.amount, 0).toLocaleString("vi-VN")} đ
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* UC4.7: Yearly Salary Report of all Doctors */}
            {activeMenu === "uc4_7" && (
              <div className="card p-6 border border-slate-100 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-xl">Báo cáo tiền lương so sánh tất cả bác sĩ</h3>
                      <p className="text-sm text-slate-500">So sánh tổng thu nhập năm giữa các bác sĩ phòng khám</p>
                    </div>
                    {hourlyRateBadge}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(Number(e.target.value))}
                      className="px-3.5 py-2.5 border rounded-xl text-sm font-bold bg-slate-50"
                    >
                      {[filterYear - 2, filterYear - 1, filterYear, filterYear + 1].map(y => (
                        <option key={y} value={y}>Năm {y}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => syncYearlyAllDoctors(filterYear)}
                      className="px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-sm font-bold transition ml-2"
                      disabled={loadingYearlyAll}
                    >
                      {loadingYearlyAll ? "Đang xử lý..." : "🔄 Đồng bộ cả năm"}
                    </button>
                  </div>
                </div>

                {loadingYearlyAll ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Chart */}
                    <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-5">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Biểu đồ so sánh tổng thu nhập cả năm {filterYear}</h4>
                      <div style={{ height: "260px" }}>
                        <Bar data={barChartData} options={barChartOptions} />
                      </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                            <th className="px-4 py-3">Tên Bác sĩ</th>
                            <th className="px-4 py-3">Học hàm/Học vị</th>
                            <th className="px-4 py-3 text-center">Hệ số lương</th>
                            <th className="px-4 py-3 text-right">Tổng thu nhập năm (VNĐ)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allDoctorsYearlySummary.map((d, index) => (
                            <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="px-4 py-3 font-bold text-slate-700">Dr. {d.name}</td>
                              <td className="px-4 py-3 font-semibold text-sky-600">{d.degree}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black">{d.docCoeff?.toFixed(1) || "N/A"}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-black text-emerald-600 text-base">
                                {d.totalAmount.toLocaleString("vi-VN")} đ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────── */}
      {/* UC4.5 MODAL: Salary Detail for one Doctor */}
      {/* ──────────────────────────────────────────────── */}
      {detailModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-blue-50">
              <div>
                <h2 className="font-black text-slate-800 text-lg">
                  📋 Chi tiết lương tháng {filterMonth}/{filterYear}
                </h2>
                {detailModal.data && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    Bác sĩ: <span className="font-bold text-sky-700">{detailModal.data.salaryRecord?.doctorName}</span>
                    {" | "}
                    Học vị: <span className="font-bold text-slate-700">{detailModal.data.salaryRecord?.doctorDegree || "Đại học"}</span>
                    {" | "}
                    Hệ số lương: <span className="font-black text-indigo-600">{degreeCoefficients[detailModal.data.salaryRecord?.doctorDegree]?.toFixed(1) || "1.2"}</span>
                  </p>
                )}
              </div>
              <button
                onClick={handleCloseDetailModal}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 flex items-center justify-center font-bold text-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailModal.loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-600 rounded-full animate-spin" />
                </div>
              ) : detailModal.data ? (
                <>
                  {/* Summary Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Tổng giờ làm việc",
                        value: detailModal.data.totalWorkingHours.toFixed(1),
                        suffix: "giờ",
                        color: "text-sky-600",
                        bg: "bg-sky-50 border-sky-100"
                      },
                      {
                        label: "Số ca khó",
                        value: detailModal.data.hardCasesCount.toString(),
                        suffix: "ca",
                        color: "text-red-600",
                        bg: "bg-red-50 border-red-100"
                      },
                      {
                        label: "Số BN khó",
                        value: detailModal.data.hardPatientsCount.toString(),
                        suffix: "bệnh nhân",
                        color: "text-orange-600",
                        bg: "bg-orange-50 border-orange-100"
                      },
                      {
                        label: "Doanh thu tháng",
                        value: detailModal.data.totalRevenue.toLocaleString("vi-VN"),
                        suffix: "đ",
                        color: "text-emerald-600",
                        bg: "bg-emerald-50 border-emerald-100"
                      },
                    ].map((stat, idx) => (
                      <div key={idx} className={`rounded-2xl p-4 border text-center ${stat.bg}`}>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className={`font-black text-2xl mt-1 ${stat.color}`}>
                          {stat.value}
                          <span className="text-xs font-normal ml-0.5">{stat.suffix}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Salary breakdown + chart side by side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Shift summary table */}
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                        <h4 className="font-bold text-slate-700 text-sm">📅 Chi tiết từng ca làm việc</h4>
                      </div>
                      <div className="overflow-y-auto max-h-80">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr className="text-slate-400 font-bold uppercase text-[10px]">
                              <th className="px-3 py-2 text-left">Ngày</th>
                              <th className="px-3 py-2 text-center">Ca</th>
                              <th className="px-3 py-2 text-center">Giờ</th>
                              <th className="px-3 py-2 text-center">BN</th>
                              <th className="px-3 py-2 text-center">HS khó</th>
                              <th className="px-3 py-2 text-center">Giờ QĐ</th>
                              <th className="px-3 py-2 text-right">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailModal.data.enrichedShiftDetails.map((shift: any) => (
                              <tr key={shift._id} className="border-b border-slate-50 hover:bg-sky-50/30">
                                <td className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">{shift.date}</td>
                                <td className="px-3 py-2 text-center">{getShiftBadge(shift.shiftType, shift.isWeekend)}</td>
                                <td className="px-3 py-2 text-center font-semibold text-slate-600">{shift.workingHours.toFixed(1)}</td>
                                <td className="px-3 py-2 text-center text-slate-500">{shift.patientsCount}</td>
                                <td className="px-3 py-2 text-center">
                                  {shift.totalDifficulty > 0 ? (
                                    <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold">{shift.totalDifficulty.toFixed(2)}</span>
                                  ) : (
                                    <span className="text-slate-300 text-[10px]">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center font-bold text-indigo-500">{shift.equivalentHours.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right font-bold text-emerald-600">{shift.shiftAmount.toLocaleString("vi-VN")} đ</td>
                              </tr>
                            ))}
                            {detailModal.data.enrichedShiftDetails.length === 0 && (
                              <tr>
                                <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                                  Không có ca làm việc nào trong tháng này.
                                </td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot>
                            <tr className="bg-indigo-50 font-black text-xs">
                              <td className="px-3 py-2 text-slate-700" colSpan={2}>Tổng cộng</td>
                              <td className="px-3 py-2 text-center text-slate-700">{detailModal.data.totalWorkingHours.toFixed(1)}</td>
                              <td className="px-3 py-2"></td>
                              <td className="px-3 py-2 text-center text-orange-600">{detailModal.data.totalDifficulty.toFixed(2)}</td>
                              <td className="px-3 py-2 text-center text-indigo-700">
                                {(detailModal.data.enrichedShiftDetails as any[]).reduce((s: number, sh: any) => s + sh.equivalentHours, 0).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-right text-emerald-700">
                                {detailModal.data.salaryRecord?.totalAmount?.toLocaleString("vi-VN")} đ
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* Doughnut chart: Difficulty distribution */}
                    <div className="border border-slate-100 rounded-2xl p-4">
                      <h4 className="font-bold text-slate-700 text-sm mb-4">📊 Phân bố mức độ khó ca khám</h4>
                      <div className="flex items-center justify-center" style={{ height: "220px" }}>
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
                                tooltip: {
                                  callbacks: {
                                    label: (ctx) => ` ${ctx.label}: ${ctx.parsed} bệnh nhân`,
                                  }
                                }
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

                      {/* Difficulty legend */}
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
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

                  {/* Patient details per shift */}
                  {detailModal.data.enrichedShiftDetails.some((sh: any) => sh.appointments.length > 0) && (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                        <h4 className="font-bold text-slate-700 text-sm">🦷 Chi tiết từng bệnh nhân đã khám trong tháng</h4>
                      </div>
                      <div className="overflow-x-auto">
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
                                <tr key={apt._id} className="border-b border-slate-50 hover:bg-slate-50/30">
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
                    </div>
                  )}

                  {/* Total Salary Summary */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5">
                    <h4 className="font-bold text-slate-700 text-sm mb-4">💰 Tổng kết lương tháng</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Hệ số bằng cấp</p>
                        <p className="font-black text-indigo-700 text-lg mt-0.5">
                          {(degreeCoefficients[detailModal.data.salaryRecord?.doctorDegree] || 1.2).toFixed(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Đơn giá/giờ</p>
                        <p className="font-black text-slate-700 text-lg mt-0.5">
                          {basicHourlyRate.toLocaleString("vi-VN")} đ
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Tổng giờ quy đổi</p>
                        <p className="font-black text-sky-700 text-lg mt-0.5">
                          {detailModal.data.salaryRecord?.totalEquivalentHours?.toFixed(2)} giờ
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Tổng lương thực nhận</p>
                        <p className="font-black text-emerald-700 text-2xl mt-0.5">
                          {detailModal.data.salaryRecord?.totalAmount?.toLocaleString("vi-VN")} đ
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-indigo-200">
                      <p className="text-xs text-slate-500">
                        <strong>Công thức:</strong> Lương = Giờ quy đổi × Hệ số bằng cấp × Đơn giá
                        <br />
                        Giờ quy đổi = Giờ làm việc × (Hệ số ca + Tổng hệ số độ khó bệnh nhân)
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  Không có dữ liệu chi tiết. Vui lòng thử lại.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={handleCloseDetailModal}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
              >
                Đóng
              </button>
              {detailModal.data && (
                <button
                  onClick={() => {
                    const d = detailModal.data!;
                    const csvContent = [
                      `CHI TIẾT LƯƠNG THÁNG ${filterMonth}/${filterYear} - Bác sĩ: ${d.salaryRecord?.doctorName}`,
                      `Học vị: ${d.salaryRecord?.doctorDegree} | Hệ số lương: ${degreeCoefficients[d.salaryRecord?.doctorDegree]?.toFixed(1) || "1.2"} | Đơn giá: ${basicHourlyRate.toLocaleString("vi-VN")} đ/h`,
                      "",
                      "Ngày,Ca,Giờ làm,BN,Số BN khó,Tổng HS khó,Giờ QĐ,Thành tiền",
                      ...d.enrichedShiftDetails.map((sh: any) =>
                        `${sh.date},${sh.shiftType},${sh.workingHours},${sh.patientsCount},${sh.appointments.filter((a: any) => a.difficulty > 0).length},${sh.totalDifficulty},${sh.equivalentHours},${sh.shiftAmount}`
                      ),
                      "",
                      `Tổng cộng:,,,${d.totalWorkingHours.toFixed(1)} giờ làm,${d.hardPatientsCount} BN khó,${d.totalDifficulty.toFixed(2)},,${d.salaryRecord?.totalAmount?.toLocaleString("vi-VN")} đ`,
                    ].join("\n");
                    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `chi-tiet-luong-${d.salaryRecord?.doctorName}-thang-${filterMonth}-${filterYear}.csv`;
                    a.click();
                  }}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition"
                >
                  📥 Xuất chi tiết CSV
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
