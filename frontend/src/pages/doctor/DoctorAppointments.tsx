import { useState } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import AppointmentCalendar from "../../components/ui/AppointmentCalendar";
import { appointmentApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import type { Appointment } from "../../types";

const statusColor: Record<string, string> = {
  pending: "badge-amber",
  confirmed: "badge-blue",
  completed: "badge-green",
  cancelled: "badge-red",
};

const approvalColor: Record<string, string> = {
  pending: "badge-amber",
  approved: "badge-green",
  rejected: "badge-red",
};

export default function DoctorAppointments() {
  const {
    data: appointments,
    loading,
    refetch,
  } = useApi<Appointment[]>(() => appointmentApi.getAll());
  const { toast } = useToast();
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [viewType, setViewType] = useState<"calendar" | "table">("calendar");

  const filtered = (appointments || []).filter(
    (a) => filter === "all" || a.status === filter,
  );

  const updateStatus = async (id: string, status: string) => {
    try {
      setActionLoading(true);
      await appointmentApi.update(id, { status });
      toast.success("Appointment updated successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to update appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      await appointmentApi.approve(id);
      toast.success("Appointment approved successfully");
      refetch();
      setShowModal(false);
      setSelected(null);
    } catch (error) {
      toast.error("Failed to approve appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      if (!rejectReason.trim()) {
        toast.error("Please provide a reason for rejection");
        return;
      }
      setActionLoading(true);
      await appointmentApi.reject(id, { reason: rejectReason });
      toast.success("Appointment rejected successfully");
      refetch();
      setShowModal(false);
      setShowRejectModal(false);
      setRejectReason("");
      setSelected(null);
    } catch (error) {
      toast.error("Failed to reject appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: "patientName",
      header: "Patient",
      render: (a: Appointment) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mint-400 to-dental-500 flex items-center justify-center text-white text-xs font-bold">
            {a.patient?.name?.charAt(0) || a.patientName?.charAt(0) || "P"}
          </div>
          <div>
            <p className="font-medium">{a.patient?.name || a.patientName}</p>
            <p className="text-xs text-surface-400">{a.patient?.email || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      render: (a: Appointment) => (
        <span>
          {typeof a.service === "string"
            ? a.service
            : a.service?.name || "General Consultation"}
        </span>
      ),
    },
    { key: "date", header: "Date" },
    { key: "time", header: "Time" },
    {
      key: "approvalStatus",
      header: "Approval",
      render: (a: Appointment) => (
        <span
          className={`badge ${approvalColor[(a as any).approvalStatus || "pending"]}`}
        >
          {(a as any).approvalStatus || "pending"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (a: Appointment) => (
        <span className={`badge ${statusColor[a.status]}`}>{a.status}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (a: Appointment) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelected(a);
              setShowModal(true);
            }}
            className="text-xs text-dental-600 font-medium hover:underline"
          >
            View
          </button>
          {(a as any).approvalStatus === "pending" && (
            <>
              <button
                onClick={() => handleApprove(a.id)}
                className="text-xs text-emerald-600 font-medium hover:underline"
                disabled={actionLoading}
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setSelected(a);
                  setShowRejectModal(true);
                }}
                className="text-xs text-red-600 font-medium hover:underline"
                disabled={actionLoading}
              >
                Reject
              </button>
            </>
          )}
          {a.status === "confirmed" &&
            (a as any).approvalStatus === "approved" && (
              <button
                onClick={() => updateStatus(a.id, "completed")}
                className="text-xs text-mint-600 font-medium hover:underline"
                disabled={actionLoading}
              >
                Complete
              </button>
            )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex">
      <DoctorSidebar />
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lịch hẹn</h1>
            <p className="text-sm text-gray-500 mt-1">
              {viewType === "calendar"
                ? (appointments || []).length
                : filtered.length}{" "}
              lịch hẹn
            </p>
          </div>
        </div>

        <div className="space-y-4 p-8">
          <div className="flex gap-2 bg-surface-100 p-1 rounded-lg">
            <button
              onClick={() => setViewType("calendar")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                viewType === "calendar"
                  ? "bg-white text-dental-600 shadow-sm"
                  : "text-surface-600 hover:text-surface-900"
              }`}
            >
              Lịch
            </button>
            <button
              onClick={() => setViewType("table")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                viewType === "table"
                  ? "bg-white text-dental-600 shadow-sm"
                  : "text-surface-600 hover:text-surface-900"
              }`}
            >
              Danh sách
            </button>
          </div>
          {viewType === "table" && (
            <div className="flex gap-2">
              {["all", "pending", "confirmed", "completed", "cancelled"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${filter === s ? "bg-dental-600 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200"}`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        {viewType === "calendar" ? (
          <AppointmentCalendar
            appointments={appointments || []}
            onSelectAppointment={(apt) => {
              setSelected(apt);
              setShowModal(true);
            }}
            loading={loading}
          />
        ) : (
          <div className="card">
            <Table columns={columns} data={filtered} loading={loading} />
          </div>
        )}

        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title="Appointment Details"
        >
          {selected && (
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  ["Patient", selected.patientName],
                  ["Doctor", selected.doctorName],
                  [
                    "Service",
                    typeof selected.service === "string"
                      ? selected.service
                      : selected.service?.name || "General Consultation",
                  ],
                  ["Date", selected.date],
                  ["Time", selected.time],
                  [
                    "Approval Status",
                    (selected as any).approvalStatus || "pending",
                  ],
                  ["Status", selected.status],
                  ["Patient Notes", selected.notes || "—"],
                  ["Doctor Notes", selected.doctorNotes || "—"],
                  ...((selected as any).rejectionReason
                    ? [["Rejection Reason", (selected as any).rejectionReason]]
                    : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <span className="label w-32 flex-shrink-0">{k}</span>
                    <span className="text-sm text-surface-800">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 flex-wrap">
                {(selected as any).approvalStatus === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(selected.id)}
                      className="btn-primary flex-1 min-w-fit"
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="btn-danger flex-1 min-w-fit"
                      disabled={actionLoading}
                    >
                      Reject
                    </button>
                  </>
                )}
                {selected.status === "confirmed" &&
                  (selected as any).approvalStatus === "approved" && (
                    <button
                      onClick={() => {
                        updateStatus(selected.id, "completed");
                        setShowModal(false);
                      }}
                      className="btn-success flex-1"
                      disabled={actionLoading}
                    >
                      Mark Complete
                    </button>
                  )}
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          open={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setRejectReason("");
          }}
          title="Reject Appointment"
        >
          <div className="space-y-4">
            <p className="text-sm text-surface-600">
              Please provide a reason for rejecting this appointment. The
              patient will be notified.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full p-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-dental-600"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleReject(selected?.id || "")}
                className="btn-danger flex-1"
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? "Processing..." : "Reject Appointment"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="btn-secondary flex-1"
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
