const express = require('express');
const router = express.Router();
const { check } = require("express-validator");

const isAuth = require('../middlewares/is-auth');

const doctorControllers = require("../controllers/doctor-controllers");

// To signup a doctor 
router.post("/signup", [
    check("name").not().isEmpty(),
    check("email").isEmail(),
    check("password").not().isEmpty(),
    check('phoneNo').not().isEmpty(),
    check('city').not().isEmpty(),
    check('state').not().isEmpty(),
    check('gender').not().isEmpty(),
    check('doctorLicense').not().isEmpty(),
    check('designation').not().isEmpty()
], doctorControllers.signup);

// To login a doctor
router.post("/login", [
    check("email").isEmail(),
    check("password").not().isEmpty()
], doctorControllers.login);

// router.use(isAuth);

// To get the list of all the doctors present in database
router.get("/all", doctorControllers.getAllDoctors);

// To get the whole list of patients of a perticular doctor 
router.get("/patients/:doctorId", doctorControllers.getPatients);

// To get the list of panding or non-consulted patients of a perticular doctor
router.get("/nonConsulted/patients/:doctorId", doctorControllers.getNonConsultedPatients);

// To login with a token which is stored in the memory of user's phone
router.post("/token/login", [
    check('token').not().isEmpty()
], doctorControllers.loginWithToken);

// To confirm a perticular patient & consult him.
router.patch("/confirm/patient/:doctorId", [
    check('patientId').not().isEmpty()
], doctorControllers.confirmPatient);

// To reject the patient's consulting request
router.patch("/reject/patient/:doctorId", [
    check('patientId').not().isEmpty()
], doctorControllers.rejectPatient);

// After the whole medication of a patient is completed
router.patch("/completed/medication/:doctorId", [
    check('patientId').not().isEmpty()
], doctorControllers.medicationEnded);

module.exports = router;