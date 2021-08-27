const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const isAuth = require('../middlewares/is-auth');
const medicineControllers = require("../controllers/medicine-controllers");

// router.use(isAuth);

// To prescribe the medicines to a perticular patient
router.post("/add" ,
    [
        check("doctorId").not().isEmpty(),
        check("patientId").not().isEmpty(),
        check('medicines').not().isEmpty()
    ]
    , medicineControllers.addMedicines);

module.exports = router;