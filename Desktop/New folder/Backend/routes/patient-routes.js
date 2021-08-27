const express = require('express');
const router = express.Router();
const { check } = require("express-validator");

const patientControllers = require("../controllers/patient-controllers");

// Middleware of jwt token for Authentication
const isAuth = require('../middlewares/is-auth');

// To signup a patient
router.post("/signup",
    [
        check("name").not().isEmpty(),
        check("email").isEmail(),
        check("password").not().isEmpty(),
        check('phoneNo').not().isEmpty(),
        check('city').not().isEmpty(),
        check('state').not().isEmpty(),
        check('gender').not().isEmpty(),
        check('age').not().isEmpty()
    ]
    , patientControllers.signup);

// To login a patient
router.post("/login",
    [
        check("email").isEmail(),
        check("password").not().isEmpty()
    ]
    , patientControllers.login);

// router.use(isAuth);

// To get the list of all the doctors which are nearby the patient
router.get("/doctorsNearBy/:patientId",  patientControllers.getDoctorsNearBy);

// To get the Information and data of a patient  
router.get("/info/:patientId", patientControllers.getPatientData);

// To get daily report which sholud be rendered when the patient logedin
router.get("/daily/:patientId", patientControllers.patientDailyRender);

// To login a patient with a jwt token for authentication
router.post("/token/login",
    [
        check('token').not().isEmpty()
    ]
    , patientControllers.loginWithToken);

// Used to consult a doctor and send the notification to a perticular doctor
router.post("/consultDoctor",
    [
        check("patientId").not().isEmpty(),
        check('doctorId').not().isEmpty()
    ]
    , patientControllers.consultDoctor);

// To add the symptoms & current medication of a patient
router.post("/addSymptomDetails/:patientId",
    [
        check("symptoms").not().isEmpty()
    ]
    , patientControllers.addSymptomDetails);

module.exports = router;