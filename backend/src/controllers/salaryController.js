const asyncHandler = require("../utils/asyncHandler");
const Salary = require("../models/Salary");
const Shift = require("../models/Shift");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { notifyDoctorSalaryUpdated } = require("../socket/salarySocket");

// @desc    Calculate salary for a doctor in a specific month/year
// @route   POST /api/salaries/calculate
// @access  Private/Admin
exports.calculateSalary = asyncHandler(async (req, res) => {
  const { doctorId, month, year, basicHourlyRate, degreeCoefficient } =
    req.body;

  // Validate inputs
  if (!doctorId || !month || !year) {
    return res.status(400).json({
      success: false,
      message: "doctorId, month, and year are required",
    });
  }

  if (month < 1 || month > 12) {
    return res.status(400).json({
      success: false,
      message: "Month must be between 1 and 12",
    });
  }

  // Check if doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: "Doctor not found",
    });
  }

  // Fetch all shifts for the doctor in that month/year
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  const shifts = await Shift.find({
    doctorId: doctorId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    status: "active",
  });

  if (shifts.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No active shifts found for this doctor in the specified month",
    });
  }

  // Process each shift and calculate salary
  let totalWorkingHours = 0;
  let totalEquivalentHours = 0;
  let totalDifficulty = 0;
  let totalAmount = 0;
  const shiftDetails = [];

  for (const shift of shifts) {
    // Calculate working hours
    const [startH, startM] = shift.startTime.split(":").map(Number);
    const [endH, endM] = shift.endTime.split(":").map(Number);
    const workingHours = endH + endM / 60 - (startH + startM / 60);

    // Get shift multiplier based on shift type
    const isWeekend = isWeekendDate(shift.date);
    const shiftMultiplier = getShiftMultiplier(shift.shiftType, isWeekend);

    // Fetch appointments for this shift to calculate difficulty
    const appointments = await Appointment.find({
      doctor: shift.doctor,
      date: shift.date,
      shiftType: shift.shiftType,
      status: { $in: ["completed", "examining", "checked-in"] },
    });

    // Calculate total difficulty from all appointments
    let shiftTotalDifficulty = 0;
    appointments.forEach((apt) => {
      // Estimate difficulty (can be enhanced with actual difficulty field)
      const difficulty = getDifficultyScore(apt);
      shiftTotalDifficulty += difficulty;
    });

    // Calculate equivalent hours = base_hours * (shift_multiplier + difficulty)
    const equivalentHours =
      workingHours * (shiftMultiplier + shiftTotalDifficulty);

    // Calculate shift amount = equivalent_hours * degree_coefficient * basic_hourly_rate
    const rate = basicHourlyRate || 210000;
    const coefficient = degreeCoefficient || 1.2;
    const shiftAmount = Math.round(equivalentHours * coefficient * rate);

    shiftDetails.push({
      date: shift.date,
      shiftType: shift.shiftType,
      startTime: shift.startTime,
      endTime: shift.endTime,
      workingHours: parseFloat(workingHours.toFixed(2)),
      shiftMultiplier: parseFloat(shiftMultiplier.toFixed(2)),
      patientsCount: appointments.length,
      totalDifficulty: parseFloat(shiftTotalDifficulty.toFixed(2)),
      equivalentHours: parseFloat(equivalentHours.toFixed(2)),
      shiftAmount: shiftAmount,
    });

    totalWorkingHours += workingHours;
    totalEquivalentHours += equivalentHours;
    totalDifficulty += shiftTotalDifficulty;
    totalAmount += shiftAmount;
  }

  // Check if salary record already exists for this doctor/month/year
  let salary = await Salary.findOne({
    doctorId: doctorId,
    month: month,
    year: year,
  });

  if (!salary) {
    // Create new salary record
    salary = new Salary({
      doctor: doctor.user,
      doctorId: doctorId,
      doctorName: doctor.name,
      month: month,
      year: year,
      basicHourlyRate: basicHourlyRate || 210000,
      degreeCoefficient: degreeCoefficient || 1.2,
      totalShifts: shifts.length,
      shiftDetails: shiftDetails,
      totalWorkingHours: parseFloat(totalWorkingHours.toFixed(2)),
      totalEquivalentHours: parseFloat(totalEquivalentHours.toFixed(2)),
      totalDifficulty: parseFloat(totalDifficulty.toFixed(2)),
      totalAmount: Math.round(totalAmount),
      status: "calculated",
    });
  } else {
    // Update existing salary record
    salary.basicHourlyRate = basicHourlyRate || 210000;
    salary.degreeCoefficient = degreeCoefficient || 1.2;
    salary.totalShifts = shifts.length;
    salary.shiftDetails = shiftDetails;
    salary.totalWorkingHours = parseFloat(totalWorkingHours.toFixed(2));
    salary.totalEquivalentHours = parseFloat(totalEquivalentHours.toFixed(2));
    salary.totalDifficulty = parseFloat(totalDifficulty.toFixed(2));
    salary.totalAmount = Math.round(totalAmount);
    salary.status = "calculated";
  }

  await salary.save();

  // Emit real-time notification to the doctor
  notifyDoctorSalaryUpdated(doctorId, salary);

  res.status(200).json({
    success: true,
    message: "Salary calculated successfully",
    data: salary,
  });
});

// @desc    Get salary record for a doctor
// @route   GET /api/salaries/:doctorId/:month/:year
// @access  Private
exports.getSalary = asyncHandler(async (req, res) => {
  const { doctorId, month, year } = req.params;

  const salary = await Salary.findOne({
    doctorId: doctorId,
    month: parseInt(month),
    year: parseInt(year),
  })
    .populate("doctor", "name email")
    .populate("approvedBy", "name email");

  if (!salary) {
    return res.status(404).json({
      success: false,
      message: "Salary record not found",
    });
  }

  res.status(200).json({
    success: true,
    data: salary,
  });
});

// @desc    Get detailed salary record with all shift/appointment info (for modal drill-down)
// @route   GET /api/salaries/:id/detail
// @access  Private/Admin
exports.getSalaryDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const salary = await Salary.findById(id)
    .populate("doctor", "name email specialization")
    .populate("approvedBy", "name email");

  if (!salary) {
    return res.status(404).json({
      success: false,
      message: "Salary record not found",
    });
  }

  // Re-calculate fresh from real shifts + appointments for this doctor/month/year
  const startDate = `${salary.year}-${String(salary.month).padStart(2, "0")}-01`;
  const endDate = new Date(salary.year, salary.month, 0).toISOString().split("T")[0];

  const shifts = await Shift.find({
    doctorId: salary.doctorId,
    date: { $gte: startDate, $lte: endDate },
    status: "active",
  }).populate("doctor", "name email");

  // Build enriched shift details
  const enrichedShiftDetails = [];
  let totalWorkingHours = 0;
  let totalDifficulty = 0;

  for (const shift of shifts) {
    const [startH, startM] = shift.startTime.split(":").map(Number);
    const [endH, endM] = shift.endTime.split(":").map(Number);
    const workingHours = endH + endM / 60 - (startH + startM / 60);

    const isWeekend = isWeekendDate(shift.date);
    const shiftMultiplier = getShiftMultiplier(shift.shiftType, isWeekend);

    // Get completed/checked-in appointments for this shift
    const appointments = await Appointment.find({
      doctor: shift.doctor._id,
      date: shift.date,
      shiftType: shift.shiftType,
      status: { $in: ["completed", "examining", "checked-in"] },
    }).populate("patient", "name email");

    let shiftTotalDifficulty = 0;
    const appointmentList = appointments.map((apt) => {
      const difficulty = getDifficultyScore(apt);
      shiftTotalDifficulty += difficulty;
      return {
        _id: apt._id,
        patientName: apt.patientName || apt.patient?.name || "N/A",
        serviceName: apt.serviceName || apt.serviceNames?.join(", ") || "Khám",
        date: apt.date,
        shiftType: apt.shiftType,
        difficulty,
        difficultyLabel: getDifficultyLabel(difficulty),
        status: apt.status,
        fee: apt.fee || 0,
      };
    });

    const equivalentHours = workingHours * (shiftMultiplier + shiftTotalDifficulty);
    const rate = salary.basicHourlyRate || 210000;
    const coefficient = salary.degreeCoefficient || 1.2;
    const shiftAmount = Math.round(equivalentHours * coefficient * rate);

    enrichedShiftDetails.push({
      _id: shift._id,
      date: shift.date,
      shiftType: shift.shiftType,
      startTime: shift.startTime,
      endTime: shift.endTime,
      workingHours: parseFloat(workingHours.toFixed(2)),
      shiftMultiplier: parseFloat(shiftMultiplier.toFixed(2)),
      isWeekend,
      dayOfWeek: getDayOfWeekLabel(shift.date),
      patientsCount: appointments.length,
      totalDifficulty: parseFloat(shiftTotalDifficulty.toFixed(2)),
      equivalentHours: parseFloat(equivalentHours.toFixed(2)),
      shiftAmount,
      appointments: appointmentList,
    });

    totalWorkingHours += workingHours;
    totalDifficulty += shiftTotalDifficulty;
  }

  // Count difficult cases
  const hardCases = enrichedShiftDetails.filter(s => s.totalDifficulty > 0);
  const totalHardPatients = enrichedShiftDetails.reduce((sum, s) => {
    return sum + s.appointments.filter(a => a.difficulty > 0).length;
  }, 0);

  // Revenue stats
  const totalRevenue = enrichedShiftDetails.reduce((sum, s) => {
    return sum + s.appointments.reduce((aSum, a) => aSum + a.fee, 0);
  }, 0);

  // Monthly breakdown
  const dayGroups = {};
  enrichedShiftDetails.forEach(s => {
    if (!dayGroups[s.date]) {
      dayGroups[s.date] = {
        date: s.date,
        dayOfWeek: s.dayOfWeek,
        shifts: [],
        totalHours: 0,
        totalDifficulty: 0,
        totalAmount: 0,
      };
    }
    dayGroups[s.date].shifts.push(s);
    dayGroups[s.date].totalHours += s.workingHours;
    dayGroups[s.date].totalDifficulty += s.totalDifficulty;
    dayGroups[s.date].totalAmount += s.shiftAmount;
  });
  const dailyBreakdown = Object.values(dayGroups).sort(function(a, b) {
    return a.date.localeCompare(b.date);
  });

  res.status(200).json({
    success: true,
    data: {
      salaryRecord: salary,
      enrichedShiftDetails,
      totalWorkingHours: parseFloat(totalWorkingHours.toFixed(2)),
      totalDifficulty: parseFloat(totalDifficulty.toFixed(2)),
      hardCasesCount: hardCases.length,
      hardPatientsCount: totalHardPatients,
      totalRevenue,
      dailyBreakdown,
    },
  });
});

// @desc    List all salaries with filters
// @route   GET /api/salaries
// @access  Private/Admin
exports.listSalaries = asyncHandler(async (req, res) => {
  const { doctorId, month, year, status, page = 1, limit = 10 } = req.query;

  // Build filter
  const filter = {};
  if (doctorId) filter.doctorId = doctorId;
  if (month) filter.month = parseInt(month);
  if (year) filter.year = parseInt(year);
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const salaries = await Salary.find(filter)
    .populate("doctor", "name email")
    .populate("doctorId", "name specialization")
    .populate("approvedBy", "name email")
    .sort({ year: -1, month: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Salary.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: salaries,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get own salary history for the logged-in doctor
// @route   GET /api/salaries/me
// @access  Private/Doctor
exports.getMySalaries = asyncHandler(async (req, res) => {
  // Find the Doctor record linked to this user
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: "Doctor record not found for this user",
    });
  }

  const { year, month, limit = 50 } = req.query;

  const filter = { doctorId: doctor._id };
  if (year) filter.year = parseInt(year);
  if (month) filter.month = parseInt(month);

  const salaries = await Salary.find(filter)
    .populate("approvedBy", "name email")
    .sort({ year: -1, month: -1, createdAt: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: salaries,
  });
});

// @desc    Approve salary
// @route   PUT /api/salaries/:id/approve
// @access  Private/Admin
exports.approveSalary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { approvalNotes } = req.body;
  const userId = req.user.id;

  const salary = await Salary.findByIdAndUpdate(
    id,
    {
      status: "approved",
      approvalNotes: approvalNotes || "",
      approvedBy: userId,
      approvedAt: new Date(),
    },
    { new: true, runValidators: true },
  )
    .populate("doctor", "name email")
    .populate("approvedBy", "name email");

  if (!salary) {
    return res.status(404).json({
      success: false,
      message: "Salary record not found",
    });
  }

  // Emit real-time notification to the doctor
  notifyDoctorSalaryUpdated(salary.doctorId, salary);

  res.status(200).json({
    success: true,
    message: "Salary approved successfully",
    data: salary,
  });
});

// @desc    Mark salary as paid
// @route   PUT /api/salaries/:id/mark-paid
// @access  Private/Admin
exports.markAsPaid = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const salary = await Salary.findById(id);
  if (!salary) {
    return res.status(404).json({
      success: false,
      message: "Salary record not found",
    });
  }

  salary.status = "paid";
  salary.paidDate = new Date();
  await salary.save();
  await salary.populate("doctor", "name email");
  await salary.populate("approvedBy", "name email");

  // Emit real-time notification to the doctor
  notifyDoctorSalaryUpdated(salary.doctorId, salary);

  res.status(200).json({
    success: true,
    message: "Salary marked as paid",
    data: salary,
  });
});

// @desc    Delete/Cancel salary
// @route   DELETE /api/salaries/:id
// @access  Private/Admin
exports.deleteSalary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const salary = await Salary.findByIdAndUpdate(
    id,
    { status: "cancelled" },
    { new: true },
  );

  if (!salary) {
    return res.status(404).json({
      success: false,
      message: "Salary record not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Salary cancelled successfully",
    data: salary,
  });
});

// @desc    Get salary summary for all doctors (by month/year)
// @route   GET /api/salaries/summary/:month/:year
// @access  Private/Admin
exports.getSalarySummary = asyncHandler(async (req, res) => {
  const { month, year } = req.params;

  const salaries = await Salary.find({
    month: parseInt(month),
    year: parseInt(year),
  })
    .populate("doctorId", "name specialization")
    .sort({ totalAmount: -1 });

  const summary = {
    month: parseInt(month),
    year: parseInt(year),
    totalDoctors: salaries.length,
    totalAmount: salaries.reduce((sum, s) => sum + s.totalAmount, 0),
    averageAmount:
      salaries.length > 0
        ? Math.round(
            salaries.reduce((sum, s) => sum + s.totalAmount, 0) /
              salaries.length,
          )
        : 0,
    salaries: salaries,
  };

  res.status(200).json({
    success: true,
    data: summary,
  });
});

// ==================== Helper Functions ====================

// Determine shift multiplier based on shift type and day of week
function getShiftMultiplier(shiftType, isWeekend) {
  if (isWeekend) {
    return 1.5; // Weekend multiplier
  }
  if (shiftType === "evening") {
    return 1.2; // Evening shift multiplier
  }
  return 1.0; // Default weekday morning/afternoon
}

// Check if a date is weekend
function isWeekendDate(dateString) {
  const date = new Date(dateString + "T00:00:00Z");
  const day = date.getUTCDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

// Estimate difficulty score from appointment
function getDifficultyScore(appointment) {
  if (appointment.difficulty !== undefined) {
    return appointment.difficulty;
  }
  if (appointment.doctorNotes && appointment.doctorNotes.length > 100) {
    return 0.3; // Complex case fallback
  }
  return 0.0; // Simple case fallback
}

// Get difficulty label for display
function getDifficultyLabel(score) {
  if (score === 0.5) return "Khó nhất";
  if (score === 0.3) return "Phức tạp";
  if (score === 0.2) return "Trung bình";
  return "Thông thường";
}

// Get day of week label in Vietnamese
function getDayOfWeekLabel(dateString) {
  const date = new Date(dateString + "T00:00:00Z");
  const day = date.getUTCDay();
  const labels = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return labels[day];
}
