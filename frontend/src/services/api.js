import axios from "axios";
const BASE_URL = "http://localhost:5000/api";
export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});
// Unwrap axios response consistently:
// - res = axios response { data: { success, data: {...} } }
// - returns the inner data payload
export function unwrap(res) {
    // Handle case where response has already been unwrapped by an interceptor
    const inner = res?.data?.data;
    if (inner !== undefined) {
        // Normal case: res.data.data exists
        return inner;
    }
    // Fallback: res.data is the payload directly
    return (res?.data ?? res);
}
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
api.interceptors.response.use((res) => {
    if (res.data) {
        const transformData = (data) => {
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
        }
        else {
            res.data = transformData(res.data);
        }
    }
    return res;
}, (err) => {
    if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }
    return Promise.reject(err);
});
// ─── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
    login: (email, password) => api.post("/auth/login", { email, password }),
    register: (data) => api.post("/auth/register", data),
    me: () => api.get("/auth/me"),
};
// ─── Users ──────────────────────────────────────────────────────────────────
export const userApi = {
    getAll: () => api.get("/users"),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post("/users", data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};
// ─── Doctors ────────────────────────────────────────────────────────────────
export const doctorApi = {
    getAll: () => api.get("/doctors").then((res) => {
        const paginated = res.data?.data;
        const docs = Array.isArray(paginated?.data) ? paginated.data : (Array.isArray(paginated) ? paginated : []);
        return { ...res, data: docs };
    }),
    getById: (id) => api.get(`/doctors/${id}`),
    create: (data) => api.post("/doctors", data),
    update: (id, data) => api.put(`/doctors/${id}`, data),
    delete: (id) => api.delete(`/doctors/${id}`),
    getPatients: () => api.get("/doctors/patients"),
};
// ─── Patients ───────────────────────────────────────────────────────────────
export const patientApi = {
    getAll: () => api.get("/patients").then((res) => {
        const paginated = res.data?.data;
        const patients = Array.isArray(paginated?.data)
            ? paginated.data
            : Array.isArray(paginated)
                ? paginated
                : [];
        return { ...res, data: patients };
    }),
    getById: (id) => api.get(`/patients/${id}`),
    getProfile: () => api.get("/patients/me"),
    update: (id, data) => api.put(`/patients/${id}`, data),
};
// ─── Appointments ───────────────────────────────────────────────────────────
export const appointmentApi = {
    getAll: () => api.get("/appointments"),
    getSlots: (doctorId, date) => api.get("/appointments/slots", { params: { doctorId, date } }),
    getMine: () => api.get("/appointments/me"),
    getById: (id) => api.get(`/appointments/${id}`),
    create: (data) => api.post("/appointments", data),
    update: (id, data) => api.put(`/appointments/${id}`, data),
    cancel: (id) => api.put(`/appointments/${id}/cancel`),
    approve: (id) => api.put(`/appointments/${id}/approve`),
    reject: (id, data) => api.put(`/appointments/${id}/reject`, data),
    complete: (id, data) => api.put(`/appointments/${id}/complete`, data || {}),
    delete: (id) => api.delete(`/appointments/${id}`),
};
// ─── Shifts ──────────────────────────────────────────────────────────────────
export const shiftApi = {
    getMine: () => api.get("/shifts/me").then((res) => {
        const paginated = res.data?.data;
        const data = Array.isArray(paginated?.data) ? paginated.data : (Array.isArray(paginated) ? paginated : []);
        return { ...res, data };
    }),
    getAll: (params) => api.get("/shifts", { params }).then((res) => {
        const paginated = res.data?.data;
        const data = Array.isArray(paginated?.data) ? paginated.data : (Array.isArray(paginated) ? paginated : []);
        return { ...res, data };
    }),
    getByDoctor: (doctorId, date) => api.get(`/shifts/by-doctor/${doctorId}`, { params: date ? { date } : {} }),
    getAvailable: (date) => api.get("/shifts/available", { params: { date } }),
    getById: (id) => api.get(`/shifts/${id}`),
    create: (data) => api.post("/shifts", data),
    update: (id, data) => api.put(`/shifts/${id}`, data),
    cancel: (id) => api.delete(`/shifts/${id}/cancel`),
    delete: (id) => api.delete(`/shifts/${id}`),
};
// ─── Medical Records ────────────────────────────────────────────────────────
export const recordApi = {
    getAll: () => api.get("/records"),
    getMine: () => api.get("/records/me"),
    getById: (id) => api.get(`/records/${id}`),
    create: (data) => api.post("/records", data),
    update: (id, data) => api.put(`/records/${id}`, data),
    delete: (id) => api.delete(`/records/${id}`),
};
// ─── Images ─────────────────────────────────────────────────────────────────
export const imageApi = {
    getAll: () => api.get("/images"),
    getMine: () => api.get("/images/me"),
    upload: (formData) => api.post("/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    }),
    delete: (id) => api.delete(`/images/${id}`),
};
// ─── Services ───────────────────────────────────────────────────────────────
export const serviceApi = {
    getAll: () => api.get("/services").then((res) => {
        const paginated = res.data?.data;
        const docs = Array.isArray(paginated?.data) ? paginated.data : (Array.isArray(paginated) ? paginated : []);
        return { ...res, data: docs };
    }),
    getById: (id) => api.get(`/services/${id}`),
    create: (data) => api.post("/services", data),
    update: (id, data) => api.put(`/services/${id}`, data),
    delete: (id) => api.delete(`/services/${id}`),
};
// ─── Dental Score ────────────────────────────────────────────────────────────
export const scoreApi = {
    getMine: () => api.get("/scores/me"),
    getByPatient: (id) => api.get(`/scores/patient/${id}`),
    updateScore: (id, data) => api.put(`/scores/patient/${id}`, data),
    editScore: (id, data) => api.post(`/scores/patient/${id}/edit`, data),
    getEditHistory: (id) => api.get(`/scores/patient/${id}/edit-history`),
};
// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentApi = {
    getAll: (params) => api.get("/payments", { params }),
    getMine: () => api.get("/payments/me"),
    getById: (id) => api.get(`/payments/${id}`),
    create: (data) => api.post("/payments", data),
    update: (id, data) => api.put(`/payments/${id}`, data),
    delete: (id) => api.delete(`/payments/${id}`),
    getStats: () => api.get("/payments/stats"),
    generateQR: (data) => api.post("/payments/qr/generate", data),
    confirmQR: (paymentId) => api.post("/payments/qr/confirm", { paymentId }),
};
// ─── Chat ────────────────────────────────────────────────────────────────────
export const chatApi = {
    publicChat: (message, history = [], sessionId) => api.post("/chat/public", { message, history, sessionId }),
    privateChat: (message, history = [], sessionId) => api.post("/chat/private", { message, history, sessionId }),
    getHistory: () => api.get("/chat/history"),
    getSession: (sessionId) => api.get(`/chat/history/${sessionId}`),
    deleteSession: (sessionId) => api.delete(`/chat/history/${sessionId}`),
};
// ─── Conversations (Peer-to-Peer) ────────────────────────────────────────────
export const conversationApi = {
    getAll: () => api.get("/conversations"),
    getById: (id) => api.get(`/conversations/${id}`),
    getAvailableUsers: () => api.get("/conversations/available-users"),
    findOrCreate: (otherUserId) => api.post("/conversations/find-or-create", { otherUserId }),
    sendMessage: (conversationId, data) => api.post(`/conversations/${conversationId}/messages`, data),
};
// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
    getDashboard: () => api.get("/admin/dashboard"),
    getUserStats: () => api.get("/admin/users/stats"),
    getAppointmentStats: (from, to) => {
        const params = new URLSearchParams();
        if (from)
            params.append("from", from);
        if (to)
            params.append("to", to);
        return api.get(`/admin/appointments/stats?${params}`);
    },
    getRecentActivity: (limit) => api.get(`/admin/activity${limit ? `?limit=${limit}` : ""}`),
    getSystemInfo: () => api.get("/admin/system"),
};
