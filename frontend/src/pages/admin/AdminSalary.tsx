import { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { doctorApi, salaryApi, shiftApi, unwrap } from "../../services/api";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

// Types
interface PatientCase {
  name: string;
  code: string;
  difficulty: number; // e.g., 0.0 to 0.5
}

interface WorkSession {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorCode: string;
  doctorDegree: string; // e.g., "Đại học", "Thạc sỹ", etc.
  date: string; // YYYY-MM-DD
  shiftName: string;
  startHour: number;
  endHour: number;
  shiftMultiplier: number;
  patients: PatientCase[];
  basicHourlyRate: number;
  totalDifficulty: number;
  equivalentHours: number;
  amount: number;
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

export default function AdminSalary() {
  const [activeMenu, setActiveMenu] = useState<string>("uc4_4"); // Default to Salary Slip
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

  // Doctor Degrees mapping (saved to localStorage)
  const [doctorDegrees, setDoctorDegrees] = useState<DoctorDegreeMap>({});

  // Backend dynamic state variables
  const [activeSalary, setActiveSalary] = useState<any>(null);
  const [loadingSalary, setLoadingSalary] = useState<boolean>(false);
  const [allSalaries, setAllSalaries] = useState<any[]>([]); // Month summary report (UC4.5)
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [yearlyTrendData, setYearlyTrendData] = useState<any[]>([]); // 1 Doctor yearly report (UC4.6)
  const [loadingYearly, setLoadingYearly] = useState<boolean>(false);
  const [allDoctorsYearly, setAllDoctorsYearly] = useState<any[]>([]); // All Doctors yearly report (UC4.7)
  const [loadingYearlyAll, setLoadingYearlyAll] = useState<boolean>(false);

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
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1); // Default to current month
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear()); // Default to current year
  const [filterDoctorId, setFilterDoctorId] = useState<string>("");

  // Load configuration from localStorage
  useEffect(() => {
    // 1. Basic Hourly Rate
    const savedRate = localStorage.getItem("salary_basic_hourly_rate");
    if (savedRate) setBasicHourlyRate(Number(savedRate));

    // 2. Degree coefficients
    const savedDegrees = localStorage.getItem("salary_degree_coefficients");
    if (savedDegrees) setDegreeCoefficients(JSON.parse(savedDegrees));

    // 3. Shift multipliers
    const savedShifts = localStorage.getItem("salary_shift_multipliers");
    if (savedShifts) setShiftMultipliers(JSON.parse(savedShifts));

    // 4. Difficulty coefficients
    const savedDifficulties = localStorage.getItem("salary_difficulty_coefficients");
    if (savedDifficulties) setDifficultyCoefficients(JSON.parse(savedDifficulties));

    // 5. Doctor degrees mapping
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
          
          // Sync degrees from loaded doctors
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
        const docRecords = records.filter((r: any) => {
          const rDocId = r.doctorId?._id || r.doctorId || "";
          return rDocId === id;
        });
        const totalAmount = docRecords.reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0);
        return {
          name: doc.name,
          degree,
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

  const isWeekend = (dateString: string): boolean => {
    const day = new Date(dateString).getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  const getDayOfWeekLabel = (dateString: string): string => {
    const day = new Date(dateString).getDay();
    const labels = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return labels[day];
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

  // Save Calculated Session by creating real Shifts and Appointments in database
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

      // 1. Create a real shift in the shifts database
      await shiftApi.create({
        doctorId: selectedDoctorId,
        date: sessionDate,
        shiftType: sessionShiftType,
        startTime: startStr,
        endTime: endStr,
        maxPatients: 10,
        notes: "Ca trực được tạo từ quản lý lương"
      });

      // 2. Create and complete appointments if patients are supplied
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

      alert("Đã thêm ca trực và ca khám thực tế thành công! Hệ thống đang tự động cập nhật phiếu lương.");
      
      // Reset Form
      setSessionPatients([{ name: "", code: "", difficulty: 0.0 }]);
      
      // Refresh active salary
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
    patients: Array.from({ length: s.patientsCount || 0 }), // dummy array for count compatibility
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

  // All Doctors monthly summary (UC4.5)
  const allDoctorsMonthlySummary = allSalaries.map((s: any) => {
    const docId = s.doctorId?._id || s.doctorId || "";
    return {
      id: docId,
      name: s.doctorName,
      code: docId.slice(-5).toUpperCase(),
      degree: s.doctorDegree || doctorDegrees[docId] || "Đại học",
      shifts: s.totalShifts || 0,
      equivHours: s.totalEquivalentHours || 0,
      totalAmount: s.totalAmount || 0
    };
  });

  // Yearly trend data for 1 Doctor (UC4.6)
  const doctorYearlyData = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const record = yearlyTrendData.find((r: any) => r.month === m);
    return {
      month: `Tháng ${m}`,
      shifts: record?.totalShifts || 0,
      equivHours: record?.totalEquivalentHours || 0,
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
          label: (ctx: any) => ` Thu nhập: ${ctx.parsed.y.toLocaleString("vi-VN")} đ`
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
          "rgba(14, 165, 233, 0.85)", // Sky blue
          "rgba(16, 185, 129, 0.85)", // Emerald
          "rgba(139, 92, 246, 0.85)", // Violet
          "rgba(245, 158, 11, 0.85)", // Amber
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
          label: (ctx: any) => ` Tổng thu nhập: ${ctx.parsed.y.toLocaleString("vi-VN")} đ`
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
            .detail-table th { bg-color: #f8fafc; font-weight: bold; }
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
    <div className="text-right bg-sky-50 border border-sky-100 rounded-xl px-4 py-1.5 flex-shrink-0 animate-fade-in shadow-sm select-none">
      <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest leading-none">Đơn giá cơ bản</p>
      <p className="text-sm font-black text-sky-700 mt-1 leading-none">{basicHourlyRate.toLocaleString("vi-VN")} đ/h</p>
    </div>
  );

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
          
          {/* LEFT SUBMENU PANEL (2-level hierarchy) */}
          <div className="w-full md:w-64 bg-white/60 backdrop-blur border-r border-slate-200/80 p-4.5 space-y-6">
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
              <div className="card p-6 border border-slate-100 max-w-2xl animate-fade-in space-y-5">
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
              <div className="card p-6 border border-slate-100 max-w-5xl animate-fade-in space-y-5">
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
                  {/* Weekdays */}
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

                  {/* Weekends */}
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
              <div className="card p-6 border border-slate-100 max-w-2xl animate-fade-in space-y-5">
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
              <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                
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
                        {/* Month */}
                        <select
                          value={filterMonth}
                          onChange={(e) => setFilterMonth(Number(e.target.value))}
                          className="px-3.5 py-2.5 border rounded-xl text-sm font-bold bg-slate-50"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                          ))}
                        </select>
                        {/* Doctor */}
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

                {/* Form to Add New Work Session (Right 1 col) */}
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
                      className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    >
                      Lưu và cộng vào phiếu lương
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* UC4.5: Monthly Salary Report of all Doctors */}
            {activeMenu === "uc4_5" && (
              <div className="card p-6 border border-slate-100 animate-fade-in space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-xl">Báo cáo tiền lương tất cả bác sĩ</h3>
                      <p className="text-sm text-slate-500">Tổng hợp thu nhập thanh toán trong tháng</p>
                    </div>
                    {hourlyRateBadge}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(Number(e.target.value))}
                      className="px-3.5 py-2.5 border rounded-xl text-sm font-bold bg-slate-50 animate-scale-in"
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
                      className="px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-sm font-bold transition mr-1"
                      disabled={loadingSummary}
                    >
                      {loadingSummary ? "Đang xử lý..." : "🔄 Đồng bộ & Làm mới"}
                    </button>
                    <button
                      onClick={() => {
                        const csvContent = [
                          "BÁO CÁO TIỀN LƯƠNG TẤT CẢ BÁC SĨ THÁNG " + filterMonth + "/" + filterYear,
                          "Mã Bác sĩ,Họ tên,Học vị,Số ca trực,Giờ quy đổi,Thành tiền (VND)",
                          ...allDoctorsMonthlySummary.map(d => `${d.code},${d.name},${d.degree},${d.shifts},${d.equivHours},${d.totalAmount}`)
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
                      📥 Xuất báo cáo CSV
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
                          <th className="px-6 py-4">Mã số</th>
                          <th className="px-6 py-4">Bác sĩ</th>
                          <th className="px-6 py-4">Học vị / Bằng cấp</th>
                          <th className="px-6 py-4 text-center">Số ca làm</th>
                          <th className="px-6 py-4 text-center">Số giờ quy đổi (QĐ)</th>
                          <th className="px-6 py-4 text-right">Lương thực lĩnh (VNĐ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allDoctorsMonthlySummary.map((d) => (
                          <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-bold text-slate-400">#{d.code}</td>
                            <td className="px-6 py-4 font-bold text-slate-700">Dr. {d.name}</td>
                            <td className="px-6 py-4 font-semibold text-sky-600">{d.degree}</td>
                            <td className="px-6 py-4 text-center font-medium text-slate-600">{d.shifts}</td>
                            <td className="px-6 py-4 text-center font-bold text-indigo-500">{d.equivHours}</td>
                            <td className="px-6 py-4 text-right font-black text-emerald-600 text-lg">
                              {d.totalAmount.toLocaleString("vi-VN")} đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* UC4.6: Yearly Salary Report of 1 Doctor (with Chart) */}
            {activeMenu === "uc4_6" && (
              <div className="card p-6 border border-slate-100 animate-fade-in space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-xl">Báo cáo tiền lương năm của Bác sĩ</h3>
                      <p className="text-sm text-slate-500">Theo dõi xu hướng thu nhập 12 tháng của bác sĩ</p>
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

                {loadingYearly ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Graph component */}
                    <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-5">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Biểu đồ xu hướng thu nhập năm {filterYear}</h4>
                      <div style={{ height: "260px" }}>
                        <Line data={lineChartData} options={lineChartOptions} />
                      </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                            <th className="px-4 py-3">Tháng</th>
                            <th className="px-4 py-3 text-center">Số ca trực</th>
                            <th className="px-4 py-3 text-center">Số giờ quy đổi (QĐ)</th>
                            <th className="px-4 py-3 text-right">Lương thực lĩnh</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doctorYearlyData.map((d, index) => (
                            <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="px-4 py-3 font-bold text-slate-700">{d.month}</td>
                              <td className="px-4 py-3 text-center text-slate-500">{d.shifts}</td>
                              <td className="px-4 py-3 text-center font-bold text-indigo-500">{d.equivHours}</td>
                              <td className="px-4 py-3 text-right font-bold text-emerald-600">{d.amount.toLocaleString("vi-VN")} đ</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* UC4.7: Yearly Salary Report of all Doctors (with comparison Chart) */}
            {activeMenu === "uc4_7" && (
              <div className="card p-6 border border-slate-100 animate-fade-in space-y-6">
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
                    {/* Graph component */}
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
                            <th className="px-4 py-3 text-right">Tổng thu nhập năm (VNĐ)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allDoctorsYearlySummary.map((d, index) => (
                            <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="px-4 py-3 font-bold text-slate-700">Dr. {d.name}</td>
                              <td className="px-4 py-3 font-semibold text-sky-600">{d.degree}</td>
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
    </div>
  );
}
