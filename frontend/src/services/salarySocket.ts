/**
 * Salary real-time socket client
 *
 * Listens for salary-updated events from the backend /salary-events namespace.
 */
import { io, Socket } from "socket.io-client";

type SalaryUpdateCallback = (data: {
  doctorId: string;
  month: number;
  year: number;
  totalAmount: number;
  status: string;
  updatedAt: string;
}) => void;

class SalarySocketService {
  private socket: Socket | null = null;
  private listeners: SalaryUpdateCallback[] = [];
  private isConnected = false;

  connect(userId: string, doctorId: string) {
    if (this.socket?.connected) return;

    this.socket = io("/salary-events", {
      auth: { userId, doctorId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      console.log("[SalarySocket] Connected to salary events namespace");
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`[SalarySocket] Disconnected: ${reason}`);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (err) => {
      console.warn("[SalarySocket] Connection error:", err.message);
    });

    this.socket.on("salary-updated", (data) => {
      console.log("[SalarySocket] Received salary update:", data);
      this.listeners.forEach((cb) => cb(data));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners = [];
    }
  }

  onSalaryUpdated(callback: SalaryUpdateCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

export const salarySocketService = new SalarySocketService();
