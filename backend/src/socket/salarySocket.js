"use strict";

/**
 * Salary real-time notifications via Socket.IO
 * Emits events when a doctor's salary is recalculated by admin.
 */

const onlineSockets = new Map(); // userId -> Set<socketId>
let salaryIO = null; // Reference to the io instance for emitting events

function setupSalarySocket(io) {
  const salaryNsp = io.of("/salary-events");
  salaryIO = io; // Store for later use in controllers

  salaryNsp.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    // Track online socket per userId
    if (!onlineSockets.has(userId)) {
      onlineSockets.set(userId, new Set());
    }
    onlineSockets.get(userId).add(socket.id);

    // Join a room named after the doctorId so we can broadcast to a specific doctor
    const doctorId = socket.handshake.auth.doctorId;
    if (doctorId) {
      socket.join(`doctor:${doctorId}`);
    }

    socket.on("disconnect", () => {
      const userSockets = onlineSockets.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineSockets.delete(userId);
        }
      }
    });
  });

  return salaryNsp;
}

/**
 * Notify a specific doctor that their salary record was updated.
 * Called from the salary controller after a successful calculate.
 */
function notifyDoctorSalaryUpdated(doctorId, salaryRecord) {
  if (!salaryIO) {
    console.warn("[SalarySocket] io not initialized, skipping notification");
    return;
  }
  const salaryNsp = salaryIO.of("/salary-events");
  salaryNsp.to(`doctor:${doctorId}`).emit("salary-updated", {
    doctorId,
    month: salaryRecord.month,
    year: salaryRecord.year,
    totalAmount: salaryRecord.totalAmount,
    status: salaryRecord.status,
    updatedAt: new Date().toISOString(),
  });
  console.log(`[SalarySocket] Notified doctor ${doctorId} about salary update`);
}

module.exports = { setupSalarySocket, notifyDoctorSalaryUpdated };
