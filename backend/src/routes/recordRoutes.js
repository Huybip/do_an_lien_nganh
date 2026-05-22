'use strict';

const router = require('express').Router();
const { getAll, getMine, getById, create, update, remove } = require('../controllers/recordController');
const { auth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

const createSchema = {
  body: Joi.object({
    patientId:      Joi.string().required(),
    appointmentId:  Joi.string().allow('', null),
    date:           Joi.string().allow('', null),
    type:           Joi.string().allow('', null),
    chiefComplaint: Joi.string().allow('', null),
    diagnosis:      Joi.string().required(),
    treatment:      Joi.string().required(),
    prescription:   Joi.string().allow('', null),
    notes:          Joi.string().allow('', null),
    followUpDate:   Joi.string().allow('', null),
    teeth:          Joi.array().items(Joi.object()).allow(null),
    vitalSigns:     Joi.object().allow(null),
  }),
};

// Patient reads own records
router.get('/me', auth, authorize('patient'), getMine);

// Doctor & Admin full access
router.get('/',    auth, authorize('admin', 'doctor'), getAll);
router.post('/',   auth, authorize('admin', 'doctor'), validate(createSchema), create);

// Shared view (ownership enforced in controller)
router.get('/:id',    auth, getById);
router.put('/:id',    auth, authorize('admin', 'doctor'), update);
router.delete('/:id', auth, authorize('admin'), remove);

module.exports = router;