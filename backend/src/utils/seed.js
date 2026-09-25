"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Service = require("../models/Service");
const DentalScore = require("../models/DentalScore");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/MedicalRecord");

const connectDB = require("../config/db");

const SERVICES = [
  {
    name: "General Check-up",
    category: "Preventive",
    duration: 30,
    price: 200000,
    description: "Routine dental examination and cleaning",
  },
  {
    name: "Teeth Cleaning",
    category: "Preventive",
    duration: 45,
    price: 300000,
    description: "Professional scaling and polishing",
  },
  {
    name: "Tooth Filling",
    category: "Restorative",
    duration: 60,
    price: 500000,
    description: "Composite or amalgam cavity filling",
  },
  {
    name: "Root Canal Treatment",
    category: "Restorative",
    duration: 90,
    price: 2000000,
    description: "Endodontic therapy for infected pulp",
  },
  {
    name: "Tooth Extraction",
    category: "General",
    duration: 30,
    price: 400000,
    description: "Simple or surgical tooth removal",
  },
  {
    name: "Teeth Whitening",
    category: "Cosmetic",
    duration: 60,
    price: 1500000,
    description: "In-office professional whitening treatment",
  },
  {
    name: "Dental Crown",
    category: "Restorative",
    duration: 90,
    price: 3000000,
    description: "Porcelain or metal crown placement",
  },
  {
    name: "Dental Implant",
    category: "Restorative",
    duration: 120,
    price: 15000000,
    description: "Titanium implant with crown restoration",
  },
  {
    name: "Braces Consultation",
    category: "Orthodontics",
    duration: 45,
    price: 300000,
    description: "Orthodontic assessment and treatment planning",
  },
  {
    name: "Emergency Treatment",
    category: "Emergency",
    duration: 30,
    price: 500000,
    description: "24h emergency dental care",
  },
  {
    name: "Dental X-Ray",
    category: "Preventive",
    duration: 15,
    price: 150000,
    description: "Digital periapical or panoramic radiograph",
  },
  {
    name: "Gum Treatment",
    category: "General",
    duration: 60,
    price: 800000,
    description: "Periodontal scaling and root planing",
  },
];

async function seed() {
  await connectDB();

  console.log("🌱 Starting database seed...");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Doctor.deleteMany({}),
    Service.deleteMany({}),
    DentalScore.deleteMany({}),
    Appointment.deleteMany({}),
    MedicalRecord.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  // Create admin
  const adminUser = await User.create({
    name: "Admin",
    email: "admin@vinamec.vn",
    password: "admin123",
    role: "admin",
    phone: "0844825565",
    isActive: true,
  });
  console.log("✅ Admin created");

  // Create doctors
  const doctorData = [
    {
      name: "Dr. Nguyễn Minh Tú",
      email: "doctor@vinamec.vn",
      phone: "0901000002",
      specialization: "General Dentistry",
    },
    {
      name: "Dr. Trần Thu Hà",
      email: "drhà@vinamec.vn",
      phone: "0901000003",
      specialization: "Orthodontics",
    },
    {
      name: "Dr. Lê Văn Hùng",
      email: "drhung@vinamec.vn",
      phone: "0901000004",
      specialization: "Oral Surgery",
    },
  ];

  const doctorUsers = [];
  const doctorProfiles = [];

  for (const d of doctorData) {
    const u = await User.create({
      ...d,
      password: "doctor123",
      role: "doctor",
      isActive: true,
    });
    const dp = await Doctor.create({
      user: u._id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      specialization: d.specialization,
      licenseNumber: `VN-DENT-${Math.floor(10000 + Math.random() * 90000)}`,
      experience: Math.floor(3 + Math.random() * 15),
      isActive: true,
    });
    doctorUsers.push(u);
    doctorProfiles.push(dp);
  }
  console.log(`✅ ${doctorUsers.length} doctors created`);

  // Create patients
  const patientData = [
    {
      name: "Nguyễn Thị Lan",
      email: "patient@vinamec.vn",
      phone: "0901000010",
      dob: "1995-03-15",
      gender: "female",
    },
    {
      name: "Võ Đình Nam",
      email: "nam@vinamec.vn",
      phone: "0901000011",
      dob: "1988-07-22",
      gender: "male",
    },
    {
      name: "Nguyễn Thị Hoa",
      email: "hoa@vinamec.vn",
      phone: "0901000012",
      dob: "2000-11-08",
      gender: "female",
    },
  ];

  const patientUsers = [];
  for (const p of patientData) {
    const u = await User.create({
      ...p,
      password: "patient123",
      role: "patient",
      isActive: true,
    });
    await Patient.create({
      user: u._id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      dob: new Date(p.dob),
      gender: p.gender,
      bloodType: ["A+", "B+", "O+", "AB+"][Math.floor(Math.random() * 4)],
      assignedDoctor: doctorProfiles[0]._id,
    });
    await DentalScore.create({
      patient: u._id,
      patientName: p.name,
      overall: Math.floor(60 + Math.random() * 35),
      gumHealth: Math.floor(60 + Math.random() * 35),
      toothDecay: Math.floor(60 + Math.random() * 35),
      alignment: Math.floor(60 + Math.random() * 35),
      cleanliness: Math.floor(60 + Math.random() * 35),
      lastAssessedBy: doctorUsers[0]._id,
      lastAssessedAt: new Date(),
      history: [
        { date: "2024-01-01", score: 65 },
        { date: "2024-03-01", score: 68 },
        { date: "2024-06-01", score: 72 },
        {
          date: new Date().toISOString().split("T")[0],
          score: Math.floor(70 + Math.random() * 20),
        },
      ],
    });
    patientUsers.push(u);
  }
  console.log(`✅ ${patientUsers.length} patients created`);

  // Create services
  const services = await Service.insertMany(SERVICES);
  console.log(`✅ ${services.length} services created`);

  // Create sample appointments
  const today = new Date().toISOString().split("T")[0];
  const apptStatuses = ["pending", "confirmed", "completed"];

  for (let i = 0; i < 6; i++) {
    const patient = patientUsers[i % patientUsers.length];
    const doctor = doctorUsers[i % doctorUsers.length];
    const service = services[i % services.length];
    const daysOffset = i - 2;
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const dateStr = d.toISOString().split("T")[0];

    await Appointment.create({
      patient: patient._id,
      patientName: patient.name,
      doctor: doctor._id,
      doctorName: doctor.name,
      service: service._id,
      serviceName: service.name,
      date: dateStr,
      time: `${String(8 + i).padStart(2, "0")}:00`,
      duration: service.duration,
      fee: service.price,
      status: apptStatuses[i % apptStatuses.length],
      notes: "Routine check-up requested by patient",
    });
  }
  console.log("✅ Sample appointments created");

  // Create sample medical records
  for (let i = 0; i < 4; i++) {
    const patient = patientUsers[i % patientUsers.length];
    const doctor = doctorUsers[i % doctorUsers.length];
    await MedicalRecord.create({
      patient: patient._id,
      patientName: patient.name,
      doctor: doctor._id,
      doctorName: doctor.name,
      date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      diagnosis: [
        "Dental Caries – Tooth #16",
        "Gingivitis – Lower anterior",
        "Enamel Erosion",
        "Healthy – No issues found",
      ][i],
      treatment: [
        "Composite filling placed",
        "Scaling and polishing performed",
        "Fluoride varnish applied, diet counseling",
        "Regular maintenance advised",
      ][i],
      prescription:
        i < 2
          ? "Ibuprofen 400mg TDS × 3 days. Chlorhexidine mouthwash BD."
          : null,
      notes: "Patient tolerated procedure well. Follow-up in 6 months.",
      followUpDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
  }
  console.log("✅ Sample medical records created");

  console.log("\n🎉 Seed complete!\n");
  console.log("─────────────────────────────────");
  console.log("🔐 Demo Credentials:");
  console.log("   Admin:   admin@vinamec.vn   / admin123");
  console.log("   Doctor:  doctor@vinamec.vn  / doctor123");
  console.log("   Patient: patient@vinamec.vn / patient123");
  console.log("─────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
