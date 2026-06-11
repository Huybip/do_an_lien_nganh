const express = require("express");
const router = express.Router();
const {
  calculateSalary,
  getSalary,
  getSalaryDetail,
  listSalaries,
  getMySalaries,
  approveSalary,
  markAsPaid,
  deleteSalary,
  getSalarySummary,
} = require("../controllers/salaryController");
const { auth, authorize } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// @route   POST /api/salaries/calculate
// @desc    Calculate salary for a doctor (Admin only)
router.post("/calculate", authorize("admin"), calculateSalary);

// @route   GET /api/salaries
// @desc    List all salaries (Admin only)
router.get("/", authorize("admin"), listSalaries);

// @route   GET /api/salaries/me
// @desc    Get own salary history (Doctor only)
router.get("/me", getMySalaries);

// @route   GET /api/salaries/summary/:month/:year
// @desc    Get salary summary for a month/year (Admin only)
router.get("/summary/:month/:year", authorize("admin"), getSalarySummary);

// @route   GET /api/salaries/:id/detail
// @desc    Get detailed salary with all shift/appointment info for a salary record (Admin only)
router.get("/:id/detail", authorize("admin"), getSalaryDetail);

// @route   GET /api/salaries/:doctorId/:month/:year
// @desc    Get salary for a specific doctor/month/year
router.get("/:doctorId/:month/:year", getSalary);

// @route   PUT /api/salaries/:id/approve
// @desc    Approve a salary record (Admin only)
router.put("/:id/approve", authorize("admin"), approveSalary);

// @route   PUT /api/salaries/:id/mark-paid
// @desc    Mark salary as paid (Admin only)
router.put("/:id/mark-paid", authorize("admin"), markAsPaid);

// @route   DELETE /api/salaries/:id
// @desc    Cancel/Delete a salary record (Admin only)
router.delete("/:id", authorize("admin"), deleteSalary);

module.exports = router;
