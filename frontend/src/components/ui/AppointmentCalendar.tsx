import { useState, useMemo } from "react";
import type { Appointment } from "../../types";

interface Props {
  appointments: Appointment[];
  onSelectAppointment?: (appointment: Appointment) => void;
  loading?: boolean;
  daysOff?: any[];
}

const statusColor: Record<string, string> = {
  pending: "bg-amber-50 border-amber-300 text-amber-900",
  confirmed: "bg-blue-50 border-blue-300 text-blue-900",
  completed: "bg-green-50 border-green-300 text-green-900",
  cancelled: "bg-red-50 border-red-300 text-red-900",
};

const statusBgColor: Record<string, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const toLocalISODate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const layoutDayAppointments = (dayApts: Appointment[]) => {
  const sorted = [...dayApts].sort((a, b) => {
    const [hA, mA] = a.time.split(":").map(Number);
    const [hB, mB] = b.time.split(":").map(Number);
    return (hA * 60 + mA) - (hB * 60 + mB);
  });

  const getAptMinutes = (apt: Appointment) => {
    const [h, m] = apt.time.split(":").map(Number);
    return h * 60 + m;
  };

  // Find overlapping clusters
  const clusters: { start: number; end: number; apts: Appointment[] }[] = [];
  sorted.forEach((apt) => {
    const start = getAptMinutes(apt);
    const end = start + (apt.duration || 60);

    let merged = false;
    for (const cluster of clusters) {
      if (start < cluster.end && end > cluster.start) {
        cluster.apts.push(apt);
        cluster.start = Math.min(cluster.start, start);
        cluster.end = Math.max(cluster.end, end);
        merged = true;
        break;
      }
    }

    if (!merged) {
      clusters.push({ start, end, apts: [apt] });
    }
  });

  // For each cluster, assign column positions
  const layoutItems: { apt: Appointment; left: number; width: number }[] = [];
  
  clusters.forEach((cluster) => {
    const cols: Appointment[][] = [];
    cluster.apts.forEach((apt) => {
      const start = getAptMinutes(apt);
      const end = start + (apt.duration || 60);

      let colIdx = 0;
      while (colIdx < cols.length) {
        const lastApt = cols[colIdx][cols[colIdx].length - 1];
        const lastStart = getAptMinutes(lastApt);
        const lastEnd = lastStart + (lastApt.duration || 60);
        const overlaps = start < lastEnd && end > lastStart;
        if (!overlaps) {
          break;
        }
        colIdx++;
      }

      if (colIdx >= cols.length) {
        cols.push([]);
      }
      cols[colIdx].push(apt);
    });

    const totalCols = cols.length;
    cols.forEach((colApts, colIdx) => {
      colApts.forEach((apt) => {
        layoutItems.push({
          apt,
          left: (colIdx * 100) / totalCols,
          width: 100 / totalCols,
        });
      });
    });
  });

  return layoutItems;
};

export default function AppointmentCalendar({
  appointments,
  onSelectAppointment,
  loading,
  daysOff,
}: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get start of week (Sunday)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const weekStart = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8:00 - 19:00

  // Parse appointment time and date
  const appointmentsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    weekDays.forEach((day) => {
      const key = toLocalISODate(day);
      map[key] = [];
    });

    (appointments || []).forEach((apt) => {
      const aptDate = apt.date; // Assuming date is in YYYY-MM-DD format
      if (map[aptDate]) {
        map[aptDate].push(apt);
      }
    });

    return map;
  }, [appointments, weekDays]);

  const getAppointmentPosition = (appointment: Appointment) => {
    const [hours, minutes] = appointment.time.split(":").map(Number);
    const startHour = 8;
    const top = (((hours - startHour) * 60 + minutes) / 60) * 64; // 64px per hour
    return top;
  };

  const nextWeek = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 7);
    setCurrentDate(date);
  };

  const prevWeek = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 7);
    setCurrentDate(date);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-96">
          <p className="text-surface-500">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-lg text-surface-900">
            Lịch khám
          </h3>
          <p className="text-sm text-surface-500">
            {weekStart.toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="p-2 hover:bg-surface-100 rounded-lg transition"
            title="Previous week"
          >
            <span className="text-xl text-surface-600">‹</span>
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1 text-sm bg-dental-50 text-dental-600 rounded-lg hover:bg-dental-100 transition font-medium"
          >
            Hôm nay
          </button>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-surface-100 rounded-lg transition"
            title="Next week"
          >
            <span className="text-xl text-surface-600">›</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Day Headers */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="w-16 flex-shrink-0"></div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="text-center">
                <div className="text-xs font-semibold text-surface-600 uppercase">
                  {day.toLocaleDateString("vi-VN", { weekday: "short" })}
                </div>
                <div
                  className={`text-sm font-bold py-1 rounded ${
                    isToday(day)
                      ? "bg-dental-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                      : "text-surface-900"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-8 gap-1 bg-surface-50 p-2 rounded-lg relative">
            {/* Time Column */}
            <div className="w-16 flex-shrink-0">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 text-xs text-surface-500 font-medium border-r border-surface-200 pr-2 text-right"
                >
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Days */}
            {weekDays.map((day) => {
              const dayKey = toLocalISODate(day);
              const dayAppointments = appointmentsByDay[dayKey] || [];
              const isTodayColumn = isToday(day);
              const dayOff = (daysOff || []).find((dOff: any) => dOff.date === dayKey);

              return (
                <div
                  key={dayKey}
                  className={`relative border-l border-surface-200 ${
                    isTodayColumn ? "bg-dental-50" : "bg-white"
                  }`}
                >
                  {dayOff && (
                    <div className="absolute inset-0 bg-rose-50/85 backdrop-blur-[1.5px] flex flex-col items-center justify-center p-3 border-l border-r border-rose-300 text-center z-10 select-none pointer-events-auto shadow-inner">
                      <span className="text-xl mb-1.5 animate-bounce">🏖️</span>
                      <span className="text-[10px] font-black text-rose-850 uppercase tracking-wider">
                        {dayOff.doctor ? "Bác sĩ nghỉ phép" : "Phòng khám nghỉ lễ"}
                      </span>
                      <span className="text-[9px] font-extrabold text-rose-600 mt-1 max-w-[90%] break-words">
                        {dayOff.description}
                      </span>
                    </div>
                  )}
                  {/* Hour Dividers */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-16 border-b border-surface-200 relative hover:bg-surface-100 transition cursor-pointer"
                    />
                  ))}

                  {/* Appointments */}
                  <div className="absolute inset-0 pointer-events-none">
                    {layoutDayAppointments(dayAppointments).map(({ apt, left, width }) => (
                      <div
                        key={apt.id}
                        className="absolute px-1 pointer-events-auto"
                        style={{
                          top: `${getAppointmentPosition(apt)}px`,
                          left: `${left}%`,
                          width: `${width}%`,
                          height: `${Math.max(38, ((apt.duration || 60) / 60) * 64)}px`,
                        }}
                      >
                        <button
                          onClick={() =>
                            onSelectAppointment && onSelectAppointment(apt)
                          }
                          className={`w-full text-left p-2 rounded border-l-4 text-xs font-medium truncate transition hover:shadow-md ${statusColor[apt.status]} ${statusBgColor[apt.status]} border-l-4 h-full`}
                          style={{
                            borderLeftColor: statusBgColor[apt.status],
                          }}
                          title={`${apt.patientName || "Patient"} - ${apt.time}`}
                        >
                          <div className="font-semibold">
                            {apt.patientName || "Patient"}
                          </div>
                          <div className="text-xs opacity-80">
                            {apt.time}
                            {apt.service &&
                              ` - ${typeof apt.service === "string" ? apt.service : apt.service.name}`}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4">
        {Object.entries(statusColor).map(([status, classes]) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded border-l-2 ${classes}`}
              style={{ borderLeftColor: statusBgColor[status] }}
            ></div>
            <span className="text-xs text-surface-600">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
