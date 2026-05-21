import { useEffect, useState } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import { appointmentApi, patientApi, recordApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import type { Appointment } from "../../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
);

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    patients: 0,
    todayAppts: 0,
    records: 0,
  });
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    Promise.allSettled([
      appointmentApi.getAll(),
      patientApi.getAll(),
      recordApi.getAll(),
    ]).then(([a, p, r]) => {
      const appts: Appointment[] =
        a.status === "fulfilled"
          ? a.value.data?.data || a.value.data || []
          : [];
      const today = new Date().toISOString().split("T")[0];
      const todayAppts = appts.filter((x: Appointment) => x.date === today);

      setAllAppointments(appts);
      setStats({
        patients:
          p.status === "fulfilled"
            ? (p.value.data?.data || p.value.data || []).length
            : 0,
        todayAppts: todayAppts.length,
        records:
          r.status === "fulfilled"
            ? (r.value.data?.data || r.value.data || []).length
            : 0,
      });
      setUpcoming(
        appts
          .filter(
            (x: Appointment) =>
              x.status === "pending" || x.status === "confirmed",
          )
          .slice(0, 5),
      );

      // Check for today's appointments
      if (todayAppts.length > 0) {
        const appointmentsList = todayAppts
          .map((apt) => `${apt.patientName} - ${apt.time}`)
          .join(", ");
        toast.info(
          `🗓️ Hôm nay bạn có ${todayAppts.length} lịch khám: ${appointmentsList}`,
          5000,
        );
      }

      setLoading(false);
    });
  }, [toast]);

  // Chart data for appointment trend
  const getAppointmentTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const appointmentsPerDay = last7Days.map(
      (day) => allAppointments.filter((apt) => apt.date === day).length,
    );

    const confirmedPerDay = last7Days.map(
      (day) =>
        allAppointments.filter(
          (apt) => apt.date === day && apt.status === "confirmed",
        ).length,
    );

    return {
      labels: last7Days.map((d) => {
        const date = new Date(d);
        return `T${date.getDate()}`;
      }),
      datasets: [
        {
          label: "Tổng lịch hẹn",
          data: appointmentsPerDay,
          fill: true,
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "#3b82f6",
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
        {
          label: "Lịch hẹn xác nhận",
          data: confirmedPerDay,
          fill: true,
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          borderColor: "#22c55e",
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: "#22c55e",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };
  };

  const appointmentChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { usePointStyle: true, padding: 15 },
      },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#e2e8f0" },
        ticks: { stepSize: 1 },
      },
      x: { grid: { display: false } },
    },
  };

  // Chart data for service distribution
  const getServiceChartData = () => {
    const serviceCount: Record<string, number> = {};
    allAppointments.forEach((apt) => {
      const serviceName =
        typeof apt.service === "string" ? apt.service : apt.service?.name;
      if (serviceName) {
        serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
      }
    });

    const labels = Object.keys(serviceCount).slice(0, 5);
    const data = labels.map((label) => serviceCount[label]);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            "#3b82f6",
            "#14b8a6",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
          ],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  };

  const serviceChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "right" as const,
        labels: { usePointStyle: true, padding: 20 },
      },
    },
  };

  return (
    <div className="flex">
      <DoctorSidebar />
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Xin chào,{" "}
              <span className="font-semibold">
                Dr. {user?.name?.split(" ").pop()}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-6 p-8">
          <div className="card bg-gradient-dental text-white border-0">
            <p className="text-dental-100 text-sm">Good morning,</p>
            <h2 className="font-display font-bold text-2xl mt-1 text-white">
              Dr. {user?.name?.split(" ").pop()}
            </h2>
            <p className="text-dental-200 text-sm mt-1">
              You have {stats.todayAppts} appointments today
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <p className="text-sm text-gray-500 font-medium">Bệnh nhân</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "—" : stats.patients}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500 font-medium">
                Lịch hẹn hôm nay
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "—" : stats.todayAppts}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-500 font-medium">Hồ sơ y tế</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "—" : stats.records}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointment Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Xu hướng lịch hẹn
              </h3>
              <p className="text-xs text-gray-500 mb-4">7 ngày gần nhất</p>
              <div style={{ height: "300px" }}>
                <Line
                  data={getAppointmentTrendData()}
                  options={appointmentChartOptions}
                />
              </div>
            </div>

            {/* Service Distribution Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Phân bổ dịch vụ
              </h3>
              <p className="text-xs text-gray-500 mb-4">Top 5 dịch vụ</p>
              <div style={{ height: "300px" }}>
                <Pie
                  data={getServiceChartData()}
                  options={serviceChartOptions}
                />
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Lịch hẹn sắp tới
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Không có lịch hẹn sắp tới
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr className="text-gray-600 font-semibold">
                      <th className="text-left py-3 px-4">Bệnh nhân</th>
                      <th className="text-left py-3 px-4">Ngày</th>
                      <th className="text-left py-3 px-4">Giờ</th>
                      <th className="text-left py-3 px-4">Dịch vụ</th>
                      <th className="text-left py-3 px-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcoming.map((apt) => (
                      <tr
                        key={apt.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {apt.patientName}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{apt.date}</td>
                        <td className="py-3 px-4 text-gray-600">{apt.time}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {typeof apt.service === "string"
                            ? apt.service
                            : apt.service?.name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${apt.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : apt.status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : apt.status === "completed"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                          >
                            {apt.status === "confirmed"
                              ? "Xác nhận"
                              : apt.status === "pending"
                                ? "Chờ"
                                : apt.status === "completed"
                                  ? "Hoàn tất"
                                  : "Hủy"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
