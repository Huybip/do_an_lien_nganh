'use strict';

const Joi = require('joi');

// ─── Primitives ──────────────────────────────────────────────────────────────
const objectId = Joi.string().pattern(/^[a-f\d]{24}$/i).messages({
  'string.pattern.base': '{{#label}} must be a valid MongoDB ObjectId',
});

const dateString = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ 'string.pattern.base': '{{#label}} must be in YYYY-MM-DD format' });

const timeString = Joi.string()
  .pattern(/^\d{2}:\d{2}$/)
  .messages({ 'string.pattern.base': '{{#label}} must be in HH:MM format' });

const phoneNumber = Joi.string()
  .pattern(/^[0-9+\-\s()]{7,20}$/)
  .messages({ 'string.pattern.base': '{{#label}} must be a valid phone number' });

const password = Joi.string().min(6).max(128).messages({
  'string.min': 'Password must be at least 6 characters',
  'string.max': 'Password must not exceed 128 characters',
});

const score = Joi.number().integer().min(0).max(100);

// ─── Pagination ───────────────────────────────────────────────────────────────
const paginationSchema = Joi.object({
  page:      Joi.number().integer().min(1).default(1),
  limit:     Joi.number().integer().min(1).max(100).default(20),
  sortBy:    Joi.string().max(50),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search:    Joi.string().max(200).allow('', null),
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
const registerSchema = {
  body: Joi.object({
    name:           Joi.string().min(2).max(100).required(),
    email:          Joi.string().email().required(),
    password:       password.required(),
    role:           Joi.string().valid('admin', 'doctor', 'patient').default('patient'),
    phone:          phoneNumber.allow('', null),
    specialization: Joi.string().max(100).allow('', null),
    dob:            dateString.allow('', null),
  }),
};

const loginSchema = {
  body: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword:     password.required(),
  }),
};

// ─── Appointment ──────────────────────────────────────────────────────────────
const createAppointmentSchema = {
  body: Joi.object({
    doctorId:    objectId.required(),
    serviceId:   objectId.allow('', null),
    serviceName: Joi.string().max(200).allow('', null),
    date:        dateString.required(),
    time:        timeString.required(),
    notes:       Joi.string().max(1000).allow('', null),
  }),
};

const updateAppointmentSchema = {
  body: Joi.object({
    status:      Joi.string().valid('pending','confirmed','completed','cancelled','no-show'),
    date:        dateString,
    time:        timeString,
    doctorNotes: Joi.string().max(2000).allow('', null),
    notes:       Joi.string().max(1000).allow('', null),
    duration:    Joi.number().integer().min(5).max(480),
    isPaid:      Joi.boolean(),
    fee:         Joi.number().min(0),
  }),
};

// ─── Medical Record ───────────────────────────────────────────────────────────
const createRecordSchema = {
  body: Joi.object({
    patientId:      objectId.required(),
    appointmentId:  objectId.allow('', null),
    date:           dateString.allow('', null),
    chiefComplaint: Joi.string().max(500).allow('', null),
    diagnosis:      Joi.string().max(2000).required(),
    treatment:      Joi.string().max(2000).required(),
    prescription:   Joi.string().max(2000).allow('', null),
    notes:          Joi.string().max(2000).allow('', null),
    followUpDate:   dateString.allow('', null),
    teeth: Joi.array().items(
      Joi.object({ number: Joi.number(), condition: Joi.string(), treatment: Joi.string() })
    ).allow(null),
    vitalSigns: Joi.object({
      bloodPressure: Joi.string().allow('', null),
      pulse:         Joi.number().allow(null),
      temperature:   Joi.number().allow(null),
    }).allow(null),
  }),
};

// ─── Service ──────────────────────────────────────────────────────────────────
const createServiceSchema = {
  body: Joi.object({
    name:         Joi.string().min(2).max(200).required(),
    description:  Joi.string().max(1000).allow('', null),
    category:     Joi.string().valid('Preventive','Restorative','Cosmetic','Emergency','General','Orthodontics','Surgery').default('General'),
    duration:     Joi.number().integer().min(5).max(480).default(30),
    price:        Joi.number().min(0).required(),
    currency:     Joi.string().max(10).default('VND'),
    requirements: Joi.array().items(Joi.string().max(200)).allow(null),
    aftercare:    Joi.string().max(1000).allow('', null),
    difficultyLevel: Joi.number().valid(0, 0.2, 0.3, 0.5).default(0),
    active:       Joi.boolean().default(true),
    sortOrder:    Joi.number().integer().default(0),
  }),
};

const updateServiceSchema = {
  body: Joi.object({
    name:         Joi.string().min(2).max(200),
    description:  Joi.string().max(1000).allow('', null),
    category:     Joi.string().valid('Preventive','Restorative','Cosmetic','Emergency','General','Orthodontics','Surgery'),
    duration:     Joi.number().integer().min(5).max(480),
    price:        Joi.number().min(0),
    currency:     Joi.string().max(10),
    requirements: Joi.array().items(Joi.string().max(200)).allow(null),
    aftercare:    Joi.string().max(1000).allow('', null),
    difficultyLevel: Joi.number().valid(0, 0.2, 0.3, 0.5),
    active:       Joi.boolean(),
    sortOrder:    Joi.number().integer(),
  }),
};

// ─── Dental Score ─────────────────────────────────────────────────────────────
const updateScoreSchema = {
  body: Joi.object({
    overall:         score,
    gumHealth:       score,
    toothDecay:      score,
    alignment:       score,
    cleanliness:     score,
    recommendations: Joi.array().items(Joi.string().max(500)),
    nextCheckupDate: dateString.allow('', null),
    historyNote:     Joi.string().max(500).allow('', null),
  }),
};

// ─── Chat ─────────────────────────────────────────────────────────────────────
const chatMessageSchema = {
  body: Joi.object({
    message:   Joi.string().min(1).max(4000).required(),
    history:   Joi.array().items(
      Joi.object({
        role:    Joi.string().valid('user','assistant','system').required(),
        content: Joi.string().max(4000).required(),
      })
    ).max(50).default([]),
    sessionId: Joi.string().max(100).allow('', null),
  }),
};

// ─── User ─────────────────────────────────────────────────────────────────────
const createUserSchema = {
  body: Joi.object({
    name:     Joi.string().min(2).max(100).required(),
    email:    Joi.string().email().required(),
    password: password.default('Password@123'),
    role:     Joi.string().valid('admin','doctor','patient').required(),
    phone:    phoneNumber.allow('', null),
  }),
};

// ─── Image ────────────────────────────────────────────────────────────────────
const uploadImageSchema = {
  body: Joi.object({
    type:          Joi.string().valid('xray','photo','scan','other').default('photo'),
    description:   Joi.string().max(500).allow('', null),
    patientId:     objectId.allow('', null),
    toothNumber:   Joi.number().integer().min(1).max(32).allow(null),
    appointmentId: objectId.allow('', null),
  }),
};

// ─── Params ────────────────────────────────────────────────────────────────────
const idParamSchema = {
  params: Joi.object({ id: objectId.required() }),
};

module.exports = {
  objectId,
  dateString,
  timeString,
  phoneNumber,
  password,
  score,
  paginationSchema,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  createRecordSchema,
  createServiceSchema,
  updateServiceSchema,
  updateScoreSchema,
  chatMessageSchema,
  createUserSchema,
  uploadImageSchema,
  idParamSchema,
};