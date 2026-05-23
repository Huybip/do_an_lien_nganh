export type Role = "admin" | "doctor" | "patient";

export interface User {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  email: string;
  role: Role;
  phone?: string;
  dob?: string;
  avatar?: string;
  specialization?: string;
  createdAt?: string;
}

export interface AuthState {
  token: string | null;
  role: Role | null;
  user: User | null;
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: { _id: string; name: string; email: string };
  patientName: string;
  doctorId: string;
  doctorName: string;
  service: Service | string;
  serviceName?: string;
  date: string;
  time: string;
  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "approved"
    | "rejected";
  approvalStatus?: "pending" | "approved" | "rejected";
  notes?: string;
  doctorNotes?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  fee?: number;
  isPaid?: boolean;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  date: string;
  notes?: string;
  status?: "completed" | "pending" | "followup";
  type?: "examination" | "treatment" | "surgery" | "checkup";
}

export interface DentalImage {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  url: string;
  type: "xray" | "photo" | "scan";
  description?: string;
  uploadedAt: string;
}

export interface Service {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  active?: boolean;
}

export interface DentalScore {
  overall: number;
  gumHealth: number;
  toothDecay: number;
  alignment: number;
  cleanliness: number;
  history: Array<{ date: string; score: number }>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "ai";
  content: string;
  timestamp?: string;
}

export interface ChatMessageFull {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  type: "text" | "image" | "audio";
  content?: string;
  imageUrl?: string;
  audioUrl?: string;
  audioName?: string;
  timestamp: string;
  isOwn?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
