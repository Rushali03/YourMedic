const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

const HttpError = require("../util/http-error");
const Patient = require("../models/patient-model");
const Doctor = require("../models/doctor-model");
const Report = require("../models/report-model");
const jwt = require('jsonwebtoken');

//////////////////////////////////////////////////////////// GET requests /////////////////////////////////////////////////////////////

// To get the whole list of patients of a perticular doctor
const getPatients = async (req,res,next) => {
    const doctorId = req.params.doctorId;

    let doctorFound;
    try{
        doctorFound = await Doctor.findById(doctorId).populate('patientIds');
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }
    if(!doctorFound){
        return next(new HttpError('Doctor not found', 500));
    }

    let patients=[];
    let insertPatient;

    if(doctorFound.patientIds.length > 0 ){
        for(let index=0 ; index<doctorFound.patientIds.length ; index++){
            if(doctorFound.patients[index].consulted){
                if(doctorFound.patients[index].active){
                    let patientReports;
                    try{
                        patientReports = await Patient.findById(doctorFound.patientIds[index].id).populate('reports').populate('prescribedMedicines');
                    }catch(err){
                        console.log(err);
                        return next(new HttpError('Something went wrong', 500));
                    }
                    insertPatient = {
                        id:patientReports.id,
                        name:patientReports.name,
                        email:patientReports.email,
                        phoneNo:patientReports.phoneNo,
                        city:patientReports.city,
                        state:patientReports.state,
                        gender:patientReports.gender,
                        age:patientReports.age,
                        active:true,
                        currentMedicines:patientReports.currentMedicines,
                        symptoms:patientReports.symptoms,
                        reports:patientReports.reports,
                        prescribedMedicines:patientReports.prescribedMedicines,
                        startDate:doctorFound.patients[index].startDate
                    };
                }
                else{
                    insertPatient = {
                        id:doctorFound.patientIds[index].id,
                        name:doctorFound.patientIds[index].name,
                        email:doctorFound.patientIds[index].email,
                        phoneNo:doctorFound.patientIds[index].phoneNo,
                        city:doctorFound.patientIds[index].city,
                        state:doctorFound.patientIds[index].state,
                        gender:doctorFound.patientIds[index].gender,
                        active:false,
                        startDate:doctorFound.patients[index].startDate,
                        endDate:doctorFound.patients[index].endDate
                    };
                }
                patients.push(insertPatient);
                if(index === doctorFound.patientIds.length - 1){
                    return res.json({patients});
                }
            }
            else{
                if(index === doctorFound.patientIds.length - 1){
                    return res.json({patients});
                }
            }
        }
    }else{
        return res.json({patients});
    }
}

// To get the list of panding or non-consulted patients of a perticular doctor
const getNonConsultedPatients = async (req,res,next) => {
    
    const doctorId = req.params.doctorId;

    let doctorFound;
    try{
        doctorFound = await Doctor.findById(doctorId).populate('patientIds');
        console.log(doctorFound.patientIds.length,doctorFound.patients.length);
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }
    if(!doctorFound){
        return next(new HttpError('Doctor not found!', 500));
    }
    
    let patients=[];
    for(let index=0 ; index<doctorFound.patientIds.length ; index++){
        if(!doctorFound.patients[index].consulted){
            console.log(doctorFound.patientIds[index].gender);
            patients.push({
                id:doctorFound.patientIds[index].id,
                name:doctorFound.patientIds[index].name,
                city:doctorFound.patientIds[index].city,
                state:doctorFound.patientIds[index].state,
                phoneNo:doctorFound.patientIds[index].phoneNo,
                startDate:doctorFound.patients[index].startDate,
                gender: doctorFound.patientIds[index].gender,
                age:doctorFound.patientIds[index].age
            });
        }
    }

    res.json({patients});
}

// To get the list of all the doctors present in database
const getAllDoctors = async (req,res,next) => {

    let doctors;
    try{
        doctors = await Doctor.find();
    }catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }
    
    res.json({doctors:doctors.map(doc => doc.toObject({ getters: true })) });
}

////////////////////////////////////////////////////////// POST Requests ////////////////////////////////////////////////////////////////

// To signup a doctor
const signup = async(req, res, next) => {

    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!',422));
    }

    const email = req.body.email;
    let password = req.body.password;
    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);

    let doctorFound;
    try {
        doctorFound = await Doctor.findOne({ email: email });
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }

    if (doctorFound) {
        return next(new HttpError('Doctor already exists.Please login', 500));
    }

    const newDoctor = new Doctor({
        name: req.body.name,
        email,
        password,
        phoneNo: req.body.phoneNo,
        city: req.body.city,
        state: req.body.state,
        gender: req.body.gender,
        doctorLicense: req.body.doctorLicense,
        designation: req.body.designation,
        patientIds: [],
        patients: []
    });

    let token;

    try {
        await newDoctor.save();
        token = jwt.sign({
            email: newDoctor.email,
            id: newDoctor._id
        }, 'innoventX123');
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong,Doctor not saved', 500));
    }

    res.json({ doctor: newDoctor.toObject({ getters: true }), token });
}

// To login a doctor
const login = async(req, res, next) => {

    console.log(req.body);
    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!',422));
    }

    const {email,password} = req.body;

    let doctorFound;
    let token;
    try {
        doctorFound = await Doctor.findOne({ email: email });
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }

    if (!doctorFound) {
        return next(new HttpError('Doctor not found.Please signup!', 500));
    } else {

        const auth = await bcrypt.compare(password, doctorFound.password);
        if (!auth) {
            return next(new HttpError('Incorrect password!', 500));
        }
        token = jwt.sign({
            email: doctorFound.email,
            id: doctorFound._id
        }, 'innoventX123');
    }

    res.json({ doctor: doctorFound.toObject({ getters: true }), token });
}

// To login with a token which is stored in the memory of user's phone
const loginWithToken = async(req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!',422));
    }

    const token = req.body.token;

    decodedToken = jwt.verify(token, 'innoventX123');

    let doctorFound;
    try {
        doctorFound = await Doctor.findOne({ email: decodedToken.email });
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }

    if (!doctorFound) {
        return next(new HttpError('Token not matched.Redirect to login page!', 500));
    }

    res.json({ doctor: doctorFound.toObject({ getters: true }) });
}

/////////////////////////////////////////////////////// PATCH Requets ////////////////////////////////////////////////////////////////////

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:"jdbhavsar213@gmail.com",
        pass: 'jaydev@385'
    }
});

// To confirm a perticular patient & consult him.
const confirmPatient = async (req,res,next) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!',422));
    }

    const doctorId = req.params.doctorId;
    const patientId = req.body.patientId;

    let doctorFound, patientFound;
    try{
        patientFound = await Patient.findById(patientId).populate("doctorIds");
        doctorFound = await Doctor.findById(doctorId).populate('patientIds');
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }
    if(!patientFound){
        return next(new HttpError('Patient not found!', 500));
    }
    if(!doctorFound){
        return next(new HttpError('Doctor not found!', 500));
    }

    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();
    today = dd + '-' + mm + '-' + yyyy;

    // Activating patient in doctor's data
    const index = doctorFound.patients.findIndex(patient => patient.patientId===patientId);
    if(index === -1){
        return next(new HttpError('Patient has not consulted the doctor', 500));
    }
    doctorFound.patients[index].consulted = true;
    doctorFound.patients[index].active = true;
    doctorFound.patients[index].startDate = today;

    // If the patient have previous doctors
    if(patientFound.doctors.length > 0){

        const indexOfCurrentlyActiveDoctor = patientFound.doctors.findIndex(doctor => doctor.active);
        // Checking if the patient is currently having any active doctor 
        if(indexOfCurrentlyActiveDoctor !== -1){
            // Deactivating the previous doctor in patient
            patientFound.doctors[indexOfCurrentlyActiveDoctor].active = false;
            if(!patientFound.doctors[indexOfCurrentlyActiveDoctor].endDate){
                patientFound.doctors[indexOfCurrentlyActiveDoctor].endDate = today;
            }
    
            // Removing the patient's data from the previous doctor's data
            const patientIndexInDoctor = patientFound.doctorIds[indexOfCurrentlyActiveDoctor].patients.findIndex(patient => patient.patientId === patientId);
            patientFound.doctorIds[indexOfCurrentlyActiveDoctor].patients[patientIndexInDoctor].active = false;
            if(!patientFound.doctorIds[indexOfCurrentlyActiveDoctor].patients[patientIndexInDoctor].endDate){
                patientFound.doctorIds[indexOfCurrentlyActiveDoctor].patients[patientIndexInDoctor].endDate = today;
            }
            try{
                patientFound.doctorIds[indexOfCurrentlyActiveDoctor].save();
            }catch(err){
                console.log(err);
                return next(new HttpError('Something went wrong.Previous doctors data not saved', 500));
            }
        }

        // Checking that the consulted doctor is already present in the patient's list or not
        const indexOfDoctor = patientFound.doctorIds.findIndex(doctor => doctor.id === doctorId);
        if(indexOfDoctor === -1){
            // Doctor is not present in the patient's list so adding the new Doctor in patient
            patientFound.doctorIds.push(doctorFound);
            patientFound.doctors.push({
                name:doctorFound.name,
                active:true,
                startDate:today,
                endDate:null
            });
            patientFound.prescribedMedicines = [];
            // patientFound.reports = [];
        }else{
            // Consulted doctor is already present in the patient's list
            patientFound.doctors[indexOfDoctor].active=true;
            patientFound.doctors[indexOfDoctor].startDate=today;
            patientFound.doctors[indexOfDoctor].endDate=null;
            patientFound.prescribedMedicines = [];
            // patientFound.reports = [];
        }
    }else{
        // If the patient have no previous doctors
        patientFound.doctorIds.push(doctorFound);
        patientFound.doctors.push({
            name:doctorFound.name,
            active:true,
            startDate:today,
            endDate:null
        });
        patientFound.prescribedMedicines = [];
    }

    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();

        await doctorFound.save({ session: sess});
        await patientFound.save({ session: sess});

        sess.commitTransaction();
    }catch(err){
        console.log(err);
        return next(new HttpError('Data not saved in patient & doctor!', 500));
    }

    //////////////////////// Email ////////////////
    let mailOptions = {
        from:"jdbhavsar213@gmail.com",
        to:`${patientFound.email}`,
        subject:"Consulted Request Approved",
        text:`Congratulations ${patientFound.name},
            ${doctorFound.name} from ${doctorFound.city},${doctorFound.state} is ready to consult you. `
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

// To reject the patient's consulting request
const rejectPatient = async ( req,res,next) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!',422));
    }

    const doctorId = req.params.doctorId;
    const patientId = req.body.patientId;

    let doctorFound, patientFound;
    try{
        patientFound = await Patient.findById(patientId);
        doctorFound = await Doctor.findById(doctorId).populate('patientIds');
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }

    const index = doctorFound.patients.findIndex(patient => patient.patientId===patientId);
    doctorFound.patients.splice(index,1);
    doctorFound.patientIds.pull(patientFound);
 
    try{
        await doctorFound.save();
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }

    //////////////////////// Email ////////////////
    let mailOptions = {
        from:"jdbhavsar213@gmail.com",
        to:`${patientFound.email}`,
        subject:"Consulted Request Rejected",
        text:`Hey ${patientFound.name},
            ${doctorFound.name} from ${doctorFound.city},${doctorFound.state} has rejected your consulting request. We suggest you to consult a new doctor.`
    };
    transporter.sendMail(mailOptions, (err,info) => {
        if(err){
            console.log(err);
        }else{
            console.log("Email sent:" + info.response);
        }
    });    

    res.json({doctor: doctorFound.toObject({ getters: true })});
}

// After the whole medication of a patient is completed
const medicationEnded = async ( req,res,next) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!',422));
    }

    const doctorId = req.params.doctorId;
    const patientId = req.body.patientId;

    let doctorFound, patientFound;
    try{
        patientFound = await Patient.findById(patientId).populate("doctorIds");
        doctorFound = await Doctor.findById(doctorId).populate('patientIds');
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }
    if(!patientFound){
        return next(new HttpError('Patient not found!', 500));
    }

    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();
    today = dd + '-' + mm + '-' + yyyy;

    const patientIndex = doctorFound.patientIds.findIndex(patient => patient.id===patientId);
    doctorFound.patients[patientIndex].active = false;
    if(!doctorFound.patients[patientIndex].endDate){
        doctorFound.patients[patientIndex].endDate = today;
    }
    const doctorIndex = patientFound.doctorIds.findIndex(doctor => doctor.id===doctorId);
    patientFound.doctors[doctorIndex].active = false;
    if(!patientFound.doctors[doctorIndex].endDate){
        patientFound.doctors[doctorIndex].endDate = today;
    }

    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();

        await doctorFound.save({ session: sess});
        await patientFound.save({ session: sess});

        sess.commitTransaction();
    }catch(err){
        console.log(err);
        return next(new HttpError('Data not saved in patient & doctor!', 500));
    }

    //////////////////////// Email ////////////////
    let mailOptions = {
        from:"jdbhavsar213@gmail.com",
        to:`${patientFound.email}`,
        subject:"Medication Completed",
        text:`Hello ${patientFound.name},
            ${doctorFound.name} from ${doctorFound.city},${doctorFound.state} has approved that your medication is completed. You are normal now!`
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

exports.signup = signup;
exports.login = login;
exports.loginWithToken = loginWithToken;
exports.getPatients = getPatients;
exports.getNonConsultedPatients = getNonConsultedPatients;
exports.confirmPatient = confirmPatient;
exports.rejectPatient = rejectPatient;
exports.medicationEnded = medicationEnded;
exports.getAllDoctors = getAllDoctors;