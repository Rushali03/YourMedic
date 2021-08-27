const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

const HttpError = require("../util/http-error");
const Patient = require("../models/patient-model");
const Doctor = require("../models/doctor-model");
const Report = require("../models/report-model");

//////////////////////////////////////////////////////////// GET /////////////////////////////////////////////////////////////////////////

// To get the list of all the doctors which are nearby the patient
const getDoctorsNearBy = async(req, res, next) => {

    const patientId = req.params.patientId;

    let patientFound;
    try {
        patientFound = await Patient.findById(patientId);
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }

    if (!patientFound) {
        return next(new HttpError('Patient not found', 500));
    }

    let patientCity = patientFound.city;
    let patientState = patientFound.state;
    let doctorsNearByCity;
    let doctorsNearByState;
    try {
        doctorsNearByCity = await Doctor.find({ city: patientCity, state: patientState});
        doctorsNearByState = await Doctor.find({ state: patientState});
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }

    if (doctorsNearByCity.length === 0) {
        if(doctorsNearByState.length === 0){
            res.json({message:"No doctors present from your state, please consult other doctors."});
        }else{
            res.json({ doctors: doctorsNearByState.map(doc => doc.toObject({ getters: true })) });        
        }    
    }else{
        res.json({ doctors: doctorsNearByCity.map(doc => doc.toObject({ getters: true })) });
    }
}

// To get the Information and data of a patient 
const getPatientData = async (req,res,next) => {

    const patientId = req.params.patientId;

    let patientFound;
    try{
        patientFound = await Patient.findById(patientId).populate('reports').populate("prescribedMedicines");
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong.', 500));
    }
    if(!patientFound){
        return next(new HttpError('Patient not found', 500));
    }

    res.json({ patient:patientFound.toObject({ getters: true})});
}

// To get daily report which sholud be rendered when the patient logedin
const patientDailyRender = async (req,res,next) => {

    const patientId = req.params.patientId;

    let patientFound;
    try{
        patientFound = await Patient.findById(patientId);
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }
    if(!patientFound){
        return next(new HttpError('Patient not found', 500));
    }

    const date = new Date().toJSON().slice(0,10);
    let todayReport;
    try{
        todayReport = await Report.findOne({date:date , patientId:patientFound.id});
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }

    let oxygen,pulse,temperature;
    if(todayReport){
        oxygen=todayReport.oxygen;
        pulse=todayReport.pulse;
        temperature = todayReport.temperature;
    }else{
        oxygen=[];
        pulse=[];
        temperature = [];
    }

    res.json({
        info:{
            symptoms:patientFound.symptoms,
            prescribedMedicines:patientFound.prescribedMedicines,
            date:todayReport.date,
            oxygen,
            pulse,
            temperature
        }
    });
}

////////////////////////////////////////////////////////////// POST ///////////////////////////////////////////////////////////////////////

// To signup a patient
const signup = async(req, res, next) => {

    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!',422));
    }

    console.log(req.body);
    const email = req.body.email;
    let password = req.body.password;

    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);

    let patientFound;
    try {
        patientFound = await Patient.findOne({ email: email });
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }

    if (patientFound) {
        return next(new HttpError('Patient already exists.Please login', 500));
    }

    const newPatient = new Patient({
        name: req.body.name,
        email: req.body.email,
        password,
        phoneNo: Number(req.body.phoneNo),
        city: req.body.city,
        state: req.body.state,
        gender: req.body.gender,
        age:Number(req.body.age),
        doctorIds: [],
        doctors: [],
        previousDiseases: [],
        symptoms: null,
        reports: [],
        prescribedMedicines: []
    });

    let token;
    try {
        await newPatient.save();
        token = jwt.sign({
            email: newPatient.email,
            id: newPatient._id
        }, 'innoventX123');
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong,Patient not saved', 500));
    }

    res.json({
        patient:{
            id:newPatient.id,
            name:newPatient.name, 
            email:newPatient.email, 
            phoneNo:newPatient.phoneNo, 
            address:newPatient.address,
            token
        }  
    });
}

// To login a patient
const login = async(req, res, next) => {

    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!',422));
    }

    console.log(req.body);
    const {email,password} = req.body;

    let patientFound;
    try {
        patientFound = await Patient.findOne({ email: email }).populate('doctorIds').populate("prescribedMedicines");
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }

    if (!patientFound) {
        return next(new HttpError('Patient not found.Please signup!', 500));
    } else {
        const auth = await bcrypt.compare(password, patientFound.password);
        if (!auth) {
            return next(new HttpError('Incorrect password!', 500));
        }
    }
    // * created token for jwt
    let token = jwt.sign({
        email: patientFound.email,
        id: patientFound._id
    }, 'innoventX123');

    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();
    today = dd + '-' + mm + '-' + yyyy;
    let todayReport;
    try{
        todayReport = await Report.findOne({date:today , patientId:patientFound.id});
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }

    let oxygen,pulse,temperature;
    if(todayReport){
        oxygen=todayReport.oxygen;
        pulse=todayReport.pulse;
        temperature = todayReport.temperature;
    }else{
        oxygen=[];
        pulse=[];
        temperature = [];
    }

    let doctors=[];
    if(patientFound.doctorIds.length !== 0){
        patientFound.doctorIds.forEach((doctor,index) => {
            let doctorFound = {
                id:doctor.id,
                name:doctor.name,
                address:doctor.address,
                phoneNo:doctor.phoneNo,
                active:patientFound.doctors[index].active
            }
            doctors.push(doctorFound);

            if(index === patientFound.doctorIds.length - 1){
                res.json({ 
                    patient: {
                        id:patientFound.id,
                        name:patientFound.name, 
                        email:patientFound.email, 
                        phoneNo:patientFound.phoneNo, 
                        address:patientFound.address, 
                        doctors:doctors,
                        token,
                        symptoms:patientFound.symptoms,
                        currentMedicines:patientFound.currentMedicines,
                        age:patientFound.age,
                        prescribedMedicines:patientFound.prescribedMedicines,
                        date:today,
                        oxygen,
                        pulse,
                        temperature
                    } 
                });
            }
        });
    }else{
        res.json({ 
            patient: {
                id:patientFound.id,
                name:patientFound.name, 
                email:patientFound.email, 
                phoneNo:patientFound.phoneNo, 
                address:patientFound.address, 
                doctors:doctors,
                token,
                symptoms:patientFound.symptoms,
                currentMedicines:patientFound.currentMedicines,
                age:patientFound.age,
                prescribedMedicines:patientFound.prescribedMedicines,
                date:today,
                oxygen,
                pulse,
                temperature
            } 
        });
    }
}

// To login a patient with a jwt token for authentication
const loginWithToken = async(req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!',422));
    }

    const token = req.body.token;

    decodedToken = jwt.verify(token, 'innoventX123');

    let patientFound;
    try {
        patientFound = await Patient.findOne({ email: docodedToken.email });
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }

    if (!patientFound) {
        return next(new HttpError('Token not matched.Redirect to login page!', 500));
    }

    res.json({ patient: patientFound.toObject({ getters: true }) });
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:"jdbhavsar213@gmail.com",
        pass: 'jaydev@385'
    }
});

// Used to consult a doctor and send the notification to a perticular doctor
const consultDoctor = async(req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!',422));
    }

    const patientId = req.body.patientId;
    const doctorId = req.body.doctorId;

    let patientFound;
    let doctorFound;
    try {
        patientFound = await Patient.findById(patientId);
        doctorFound = await Doctor.findById(doctorId);
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }
    if (!doctorFound) {
        return next(new HttpError('Doctor not found', 500));
    }

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = dd + '-' + mm + '-' + yyyy;


    const indexOfPatient = doctorFound.patients.findIndex(patient => patient.patientId===patientId);
    if(indexOfPatient === -1){
        doctorFound.patientIds.push(patientFound);
        doctorFound.patients.push({
            patientId:patientFound.id,
            consulted: false,
            active: false,
            startDate: today,
            endDate: null
        });
    }else{
        if(doctorFound.patients.active){
            console.log(err);
            return next(new HttpError('This doctor is already consulting you', 500));
        }else{
            doctorFound.patients[indexOfPatient].consulted = false;
            doctorFound.patients[indexOfPatient].startDate = today;
            doctorFound.patients[indexOfPatient].endDate = null;
        }
    }

    try {
        await doctorFound.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError('Data not saved in doctor', 500));
    }

    //////////////////////////////////// Email //////////

    let mailOptions = {
        from:"jdbhavsar213@gmail.com",
        to:`${doctorFound.email}`,
        subject:"New Patient Request",
        text:`Hello ${doctorFound.name},
            ${patientFound.name} from ${patientFound.city},${patientFound.state} has requested you to consult them. `
    };

    transporter.sendMail(mailOptions, (err,info) => {
        if(err){
            console.log(err);
        }else{
            console.log("Email sent:" + info.response);
        }
    });

    res.json({ doctor: doctorFound.toObject({ getters: true }), patient: patientFound.toObject({ getters: true }) });
}

// To add the symptoms & current medication of a patient
const addSymptomDetails = async (req,res,next) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!',422));
    }

    const patientId = req.params.patientId;
    const {symptoms, currentMedicines} = req.body;

    let patientFound;
    try{
        patientFound = await Patient.findById(patientId).populate('doctorIds');
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong.', 500));   
    }

    patientFound.symptoms = symptoms;
    patientFound.currentMedicines = currentMedicines;
    try{
        patientFound.save();
    }catch(err){
        console.log(err);
        return next(new HttpError('Patient data not saved.', 500));   
    }

    res.json({patient: patientFound.toObject({ getters: true })});
}

exports.signup = signup;
exports.login = login;
exports.getDoctorsNearBy = getDoctorsNearBy;
exports.consultDoctor = consultDoctor;
exports.loginWithToken = loginWithToken;
exports.addSymptomDetails = addSymptomDetails;
exports.patientDailyRender = patientDailyRender;
exports.getPatientData = getPatientData;
