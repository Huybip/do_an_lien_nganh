import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Unwrap axios response consistently:
// - res = axios response { data: { success, data: {...} } }
// - returns the inner data payload
export function unwrap<T = any>(res: any): T {
  // Handle case where response has already been unwrapped by an interceptor
  const inner = res?.data?.data;
  if (inner !== undefined) {
    // Normal case: res.data.data exists
    return inner as T;
  }
  // Fallback: res.data is the payload directly
  return (res?.data ?? res) as T;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (res.data) {
      const transformData = (data: any): any => {
        if (Array.isArray(data)) {
          return data.map(transformData);
        }
        if (data && typeof data === "object") {
          // If this object has a "data" property that is an array (paginated response),
          // recursively transform each item inside it
          if (Array.isArray(data.data)) {
            return { ...data, data: data.data.map(transformData) };
          }
          // Otherwise if it has _id, add id field
          if (data._id && !data.id) {
            return { ...data, id: data._id };
          }
        }
        return data;
      };

      if (res.data.data) {
        res.data.data = transformData(res.data.data);
      } else {
        res.data = transformData(res.data);
      }
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: Record<string, string>) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// ─── Users ──────────────────────────────────────────────────────────────────
export const userApi = {
  getAll: () => api.get("/users"),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: object) => api.post("/users", data),
  update: (id: string, data: object) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// ─── Doctors ────────────────────────────────────────────────────────────────
export const doctorApi = {
  getAll: () =>
    api.get("/doctors").then((res) => {
      const paginated = res.data?.data;
      const docs = Array.isArray(paginated?.data) ? paginated.data : (Array.isArray(paginated) ? paginated : []);
      return { ...res, data: docs };
    }),
  getById: (id: string) => api.get(`/doctors/${id}`),
  create: (data: object) => api.post("/doctors", data),
  update: (id: string, data: object) => api.put(`/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/doctors/${id}`),
  getPatients: () => api.get("/doctors/patients"),
};

// ─── Patients ───────────────────────────────────────────────────────────────
export const patientApi = {
  getAll: () =>
    api.get("/patients").then((res) => {
      const paginated = res.data?.data;
      const patients = Array.isArray(paginated?.data)
        ? paginated.data
        : Array.isArray(paginated)
        ? paginated
        : [];
      return { ...res, data: patients };
    }),
  getById: (id: string) => api.get(`/patients/${id}`),
  getProfile: () => api.get("/patients/me"),
  update: (id: string, data: object) => api.put(`/patients/${id}`, data),
};

// ─── Appointments ───────────────────────────────────────────────────────────
export const appointmentApi = {
  getAll: () => api.get("/appointments"),
  getSlots: (doctorId: string, date: string) =>
    api.get("/appointments/slots", { params: { doctorId, date } }),
  getMine: () => api.get("/appointments/me"),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: object) => api.post("/appointments", data),
  update: (id: string, data: object) => api.put(`/appointments/${id}`, data),
  cancel: (id: string) => api.put(`/appointments/${id}/cancel`),
  approve: (id: string) => api.put(`/appointments/${id}/approve`),
  reject: (id: string, data: object) =>
    api.put(`/appointments/${id}/reject`, data),
  complete: (id: string, data?: object) =>
    api.put(`/appointments/${id}/complete`, data || {}),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// ─── Shifts ──────────────────────────────────────────────────────────────────
export const shiftApi = {
  getMine: () =>
    api.get("/shifts/me").then((res) => {
      const paginated = res.data?.data;
      const data = Array.isArray(paginated?.data) ? paginated.data : (Array.isArray(paginated) ? paginated : []);
      return { ...res, data };
    }),
  getAll: (params?: object) =>
    api.get("/shifts", { params }).then((res) => {
      const paginated = res.data?.data;
      const data = Array.isArray(paginated?.data) ? paginated.data : (Array.isArray(paginated) ? paginated : []);
      return { ...res, data };
    }),
  getByDoctor: (doctorId: string, date?: string) =>
    api.get(`/shifts/by-doctor/${doctorId}`, { params: date ? { date } : {} }),
  getAvailable: (date: string) =>
    api.get("/shifts/available", { params: { date } }),
  getById: (id: string) => api.get(`/shifts/${id}`),
  create: (data: object) => api.post("/shifts", data),
  update: (id: string, data: object) => api.put(`/shifts/${id}`, data),
  cancel: (id: string) => api.delete(`/shifts/${id}/cancel`),
  delete: (id: string) => api.delete(`/shifts/${id}`),
};

// ─── Medical Records ────────────────────────────────────────────────────────
export const recordApi = {
  getAll: () => api.get("/records"),
  getMine: () => api.get("/records/me"),
  getById: (id: string) => api.get(`/records/${id}`),
  create: (data: object) => api.post("/records", data),
  update: (id: string, data: object) => api.put(`/records/${id}`, data),
  delete: (id: string) => api.delete(`/records/${id}`),
};


// ─── Images ─────────────────────────────────────────────────────────────────
export const imageApi = {
  getAll: () => api.get("/images"),
  getMine: () => api.get("/images/me"),
  upload: (formData: FormData) =>
    api.post("/images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) => api.delete(`/images/${id}`),
};

// ─── Services ───────────────────────────────────────────────────────────────
export const serviceApi = {
  getAll: () =>
    api.get("/services").then((res) => {
      const paginated = res.data?.data;
      const docs = Array.isArray(paginated?.data) ? paginated.data : (Array.isArray(paginated) ? paginated : []);
      return { ...res, data: docs };
    }),
  getById: (id: string) => api.get(`/services/${id}`),
  create: (data: object) => api.post("/services", data),
  update: (id: string, data: object) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// ─── Dental Score ────────────────────────────────────────────────────────────
export const scoreApi = {
  getMine: () => api.get("/scores/me"),
  getByPatient: (id: string) => api.get(`/scores/patient/${id}`),
  updateScore: (id: string, data: object) =>
    api.put(`/scores/patient/${id}`, data),
  editScore: (id: string, data: object) =>
    api.post(`/scores/patient/${id}/edit`, data),
  getEditHistory: (id: string) => api.get(`/scores/patient/${id}/edit-history`),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentApi = {
  getAll: (params?: Record<string, string>) =>
    api.get("/payments", { params }),
  getMine: () => api.get("/payments/me"),
  getById: (id: string) => api.get(`/payments/${id}`),
  create: (data: object) => api.post("/payments", data),
  update: (id: string, data: object) => api.put(`/payments/${id}`, data),
  delete: (id: string) => api.delete(`/payments/${id}`),
  getStats: () => api.get("/payments/stats"),
  generateQR: (data: {
    amount: number;
    invoiceNumber?: string;
    patientName?: string;
    description?: string;
  }) => api.post("/payments/qr/generate", data),
  confirmQR: (paymentId: string) =>
    api.post("/payments/qr/confirm", { paymentId }),
  confirmPayment: (paymentId: string, reason?: string) =>
    api.post("/payments/confirm", { paymentId, reason }),
};

// ─── Chat ────────────────────────────────────────────────────────────────────
export const chatApi = {
  publicChat: (message: string, history: object[] = [], sessionId?: string) =>
    api.post("/chat/public", { message, history, sessionId }),
  privateChat: (message: string, history: object[] = [], sessionId?: string) =>
    api.post("/chat/private", { message, history, sessionId }),
  getHistory: () => api.get("/chat/history"),
  getSession: (sessionId: string) => api.get(`/chat/history/${sessionId}`),
  deleteSession: (sessionId: string) => api.delete(`/chat/history/${sessionId}`),
};

// ─── Conversations (Peer-to-Peer) ────────────────────────────────────────────
export const conversationApi = {
  getAll: () => api.get("/conversations"),
  getById: (id: string) => api.get(`/conversations/${id}`),
  getAvailableUsers: () => api.get("/conversations/available-users"),
  findOrCreate: (otherUserId: string) =>
    api.post("/conversations/find-or-create", { otherUserId }),
  sendMessage: (conversationId: string, data: object) =>
    api.post(`/conversations/${conversationId}/messages`, data),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUserStats: () => api.get("/admin/users/stats"),
  getAppointmentStats: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    return api.get(`/admin/appointments/stats?${params}`);
  },
  getRecentActivity: (limit?: number) =>
    api.get(`/admin/activity${limit ? `?limit=${limit}` : ""}`),
  getSystemInfo: () => api.get("/admin/system"),
};
