import axios from "axios";
const BASE_URL = "http://localhost:5000/api";
export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
api.interceptors.response.use((res) => {
    // Transform _id to id for API responses
    if (res.data) {
        const transformData = (data) => {
            if (Array.isArray(data)) {
                return data.map(transformData);
            }
            if (data && typeof data === "object" && data._id && !data.id) {
                return { ...data, id: data._id };
            }
            return data;
        };
        // Transform nested data, pagination results, etc
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
    getAll: () => api.get("/doctors"),
    getById: (id) => api.get(`/doctors/${id}`),
    create: (data) => api.post("/doctors", data),
    update: (id, data) => api.put(`/doctors/${id}`, data),
    delete: (id) => api.delete(`/doctors/${id}`),
    getPatients: () => api.get("/doctors/patients"),
};
// ─── Patients ───────────────────────────────────────────────────────────────
export const patientApi = {
    getAll: () => api.get("/patients"),
    getById: (id) => api.get(`/patients/${id}`),
    getProfile: () => api.get("/patients/me"),
    update: (id, data) => api.put(`/patients/${id}`, data),
};
// ─── Appointments ───────────────────────────────────────────────────────────
export const appointmentApi = {
    getAll: () => api.get("/appointments"),
    getMine: () => api.get("/appointments/me"),
    getById: (id) => api.get(`/appointments/${id}`),
    create: (data) => api.post("/appointments", data),
    update: (id, data) => api.put(`/appointments/${id}`, data),
    cancel: (id) => api.put(`/appointments/${id}/cancel`),
    approve: (id) => api.put(`/appointments/${id}/approve`),
    reject: (id, data) => api.put(`/appointments/${id}/reject`, data),
    delete: (id) => api.delete(`/appointments/${id}`),
};
// ─── Medical Records ────────────────────────────────────────────────────────
export const recordApi = {
    getAll: () => api.get("/records"),
    getMine: () => api.get("/records/me"),
    getById: (id) => api.get(`/records/${id}`),
    create: (data) => api.post("/records", data),
    update: (id, data) => api.put(`/records/${id}`, data),
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
    getAll: () => api.get("/services"),
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
// ─── Chat ────────────────────────────────────────────────────────────────────
export const chatApi = {
    publicChat: (message) => api.post("/chat/public", { message }),
    privateChat: (message, history) => api.post("/chat/private", { message, history }),
    getHistory: () => api.get("/chat/history"),
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
