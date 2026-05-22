"use strict";

const User         = require('../models/User');
const Patient      = require('../models/Patient');
const Doctor       = require('../models/Doctor');
const Appointment   = require('../models/Appointment');
const MedicalRecord= require('../models/MedicalRecord');
const ImageAnalysis= require('../models/ImageAnalysis');
const Service      = require('../models/Service');
const ChatHistory  = require('../models/ChatHistory');
const DentalScore  = require('../models/DentalScore');
const Payment      = require('../models/Payment');
const { sendSuccess, sendError } = require('../utils/response');
const { todayString } = require('../utils/helpers');

// GET /api/admin/dashboard  – aggregate KPIs in a single request
const getDashboard = async (req, res) => {
  try {
    const today = todayString();

    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      totalRecords,
      totalImages,
      totalServices,
      activeServices,
      totalChats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'doctor',  isActive: true }),
      User.countDocuments({ role: 'patient', isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: today }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      MedicalRecord.countDocuments(),
      ImageAnalysis.countDocuments({ isActive: true }),
      Service.countDocuments(),
      Service.countDocuments({ active: true }),
      ChatHistory.countDocuments(),
    ]);

    // Revenue from Payment model (actual recorded payments)
    // All payments created via create() have status="paid" and paidAt set
    const paymentRevenueAgg = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = paymentRevenueAgg[0]?.total || 0;

    // Revenue this month — use paidAt (always set for paid payments)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthRevenueAgg = await Payment.aggregate([
      { $match: { status: "paid", paidAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const monthRevenue = monthRevenueAgg[0]?.total || 0;

    // Monthly appointment trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrend = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top 5 services by appointment count
    const topServices = await Appointment.aggregate([
      { $group: { _id: '$serviceName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // New users in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Average dental score
    const scoreAgg = await DentalScore.aggregate([
      { $group: { _id: null, avg: { $avg: '$overall' } } },
    ]);
    const avgDentalScore = Math.round(scoreAgg[0]?.avg || 0);

    return sendSuccess(res, 200, 'Dashboard data retrieved', {
      users: {
        total: totalUsers,
        doctors: totalDoctors,
        patients: totalPatients,
        newThisMonth: newUsersThisMonth,
      },
      appointments: {
        total: totalAppointments,
        today: todayAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
      },
      records:  { total: totalRecords },
      images:   { total: totalImages },
      services: { total: totalServices, active: activeServices },
      chat:     { totalSessions: totalChats },
      revenue:  { total: totalRevenue, month: monthRevenue },
      analytics: {
        monthlyAppointmentTrend: monthlyTrend,
        topServices,
        avgDentalScore,
      },
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/admin/users/stats
const getUserStats = async (req, res) => {
  try {
    const [byRole, activeCount, inactiveCount, recentSignups] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt'),
    ]);

    return sendSuccess(res, 200, 'User stats retrieved', {
      byRole,
      activeCount,
      inactiveCount,
      recentSignups,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/admin/appointments/stats
const getAppointmentStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    const matchFilter = {};
    if (from || to) {
      matchFilter.date = {};
      if (from) matchFilter.date.$gte = from;
      if (to)   matchFilter.date.$lte = to;
    }

    const [byStatus, byDoctor, daily, revenue] = await Promise.all([
      Appointment.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$doctorName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Appointment.aggregate([
        { $match: { ...matchFilter, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Appointment.aggregate([
        { $match: { ...matchFilter, status: 'completed', isPaid: true } },
        { $group: { _id: null, total: { $sum: '$fee' }, count: { $sum: 1 } } },
      ]),
    ]);

    return sendSuccess(res, 200, 'Appointment stats retrieved', {
      byStatus,
      byDoctor,
      dailyTrend: daily,
      revenue: { total: revenue[0]?.total || 0, paid: revenue[0]?.count || 0 },
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/admin/activity  – recent activity feed
const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const [recentUsers, recentAppointments, recentRecords, recentImages] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Appointment.find().sort({ createdAt: -1 }).limit(5).select('patientName doctorName serviceName status createdAt'),
      MedicalRecord.find().sort({ createdAt: -1 }).limit(5).select('patientName doctorName diagnosis createdAt'),
      ImageAnalysis.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('patientName type createdAt'),
    ]);

    // Merge and sort by date
    const feed = [
      ...recentUsers.map(u => ({ type: 'user_registered', icon: 'user', message: `New ${u.role} registered: ${u.name}`, timestamp: u.createdAt })),
      ...recentAppointments.map(a => ({ type: 'appointment', icon: 'calendar', message: `Appointment ${a.status}: ${a.patientName} → Dr. ${a.doctorName}`, timestamp: a.createdAt })),
      ...recentRecords.map(r => ({ type: 'record', icon: 'file', message: `Record created for ${r.patientName}: ${r.diagnosis}`, timestamp: r.createdAt })),
      ...recentImages.map(i => ({ type: 'image', icon: 'image', message: `${i.type} uploaded for ${i.patientName}`, timestamp: i.createdAt })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return sendSuccess(res, 200, 'Recent activity retrieved', feed);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/admin/system  – system health info
const getSystemInfo = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const os = require('os');

    return sendSuccess(res, 200, 'System info retrieved', {
      server: {
        nodeVersion: process.version,
        platform:    process.platform,
        uptime:      Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        cpuCount:    os.cpus().length,
        hostname:    os.hostname(),
      },
      database: {
        state:    ['disconnected','connected','connecting','disconnecting'][mongoose.connection.readyState] || 'unknown',
        host:     mongoose.connection.host,
        name:     mongoose.connection.name,
      },
      env: {
        nodeEnv:   process.env.NODE_ENV,
        port:      process.env.PORT,
        uploadDir: process.env.UPLOAD_DIR,
        aiEnabled: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')),
      },
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = { getDashboard, getUserStats, getAppointmentStats, getRecentActivity, getSystemInfo };
