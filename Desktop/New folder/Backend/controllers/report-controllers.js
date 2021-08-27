const mongoose = require("mongoose");
const fetch = require("node-fetch");
const jwt = require('jsonwebtoken');
const {v4 : uuidv4} = require('uuid');
const { validationResult } = require("express-validator");

const HttpError = require("../util/http-error");
const Patient = require("../models/patient-model");
const Doctor = require("../models/doctor-model");
const Medicine = require("../models/medicine-model");
const Report = require("../models/report-model");

/////////////////////////////////////////////////////////////////// GET Requests //////////////////////////////////////////////////////

// To get a patient's report of a perticular day
const getReportByDate = async (req,res,next) => {

    const patientId = req.params.patientId;
    const date = req.params.date;

    let reportFound;
    try{
        reportFound = await Report.findOne({date:date , patientId:patientId});
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong.', 500));
    }
    if(!reportFound){
        return next(new HttpError('Report not found!', 500));
    }

    res.json({
        report:{
            date:reportFound.date,
            oxygen:reportFound.oxygen,
            pulse:reportFound.pulse,
            temperature:reportFound.temperature
        }
    });
}

////////////////////////////////////////////////////////////////// POST Requests ///////////////////////////////////////////////////////

// To add the patient's level into the report
const addReport = async (req,res,next) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!',422));
    }
    
    const patientId = req.params.patientId;
    const {oxygenLevel ,pulseLevel, temperatureLevel} = req.body;

    let patientFound;
    try{
        patientFound = await Patient.findById(patientId).populate('doctorIds');
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong.', 500));
    }
    if(!patientFound){
        return next(new HttpError('patient not found', 500));
    }

    const d = new Date();
    let dd = String(d.getDate()).padStart(2, '0');
    let mm = String(d.getMonth() + 1).padStart(2, '0');
    let yyyy = d.getFullYear();
    let date = dd + '-' + mm + '-' + yyyy;
    let hour = d.getHours();
    const minutes = Number(d.getMinutes());
    if(minutes>30){
        if(hour===24){
            hour=1;
        }else{
            hour = hour+1;
        }
    }
    let reportFound;
    try{
        reportFound = await Report.findOne({date:date , patientId:patientFound.id});
    }catch(err){
        console.log(err);
        return next(new HttpError('Something went wrong.', 500));
    }

    if(reportFound){
        const indexOfActiveDoctor = patientFound.doctors.findIndex((doctor) => doctor.active);
        reportFound.doctorId = patientFound.doctorIds[indexOfActiveDoctor].id,
        reportFound.doctorName = patientFound.doctorIds[indexOfActiveDoctor].name
        reportFound.oxygen.push({
            level:oxygenLevel,
            time:hour
        });
        reportFound.pulse.push({
            level:pulseLevel,
            time:hour
        });
        reportFound.temperature.push({
            level:temperatureLevel,
            time:hour
        });

        try{
            reportFound.save();
        }catch(err){
            console.log(err);
            return next(new HttpError('Report not saved', 500));
        }

    }else{
        reportFound = new Report({
            dateId:uuidv4(),
            date,
            patientId:patientFound.id,
            patientName:patientFound.name,
            doctorId:patientFound.doctorIds[patientFound.doctorIds.length-1].id,
            doctorName:patientFound.doctorIds[patientFound.doctorIds.length-1].name,
            oxygen:[{
                level:oxygenLevel,
                time:hour
            }],
            pulse:[{
                level:pulseLevel,
                time:hour
            }],
            temperature:[{
                level:temperatureLevel,
                time:hour
            }]
        });

        try{
            const sess = await mongoose.startSession();
            sess.startTransaction();

            await reportFound.save({session: sess});

            patientFound.reports.push(reportFound);
            await patientFound.save({ session: sess});

            sess.commitTransaction();
        }catch(err){
            console.log(err);
            return next(new HttpError('Report not saved', 500));
        }
    }

    if(oxygenLevel<95 || pulseLevel<84 || temperatureLevel>102){
        // Medicines notification which should be sended to the patient
        let notification = {
            'title':"CRITICAL CONDITION",
            'text':`${patientFound.name} call you doctor Immediately!`
        }

        // Tokens of mobile devices
        let fcm_tokens = [patientFound.accessKey];

        var notification_body = {
            'notification':notification,
            'registration_ids':fcm_tokens
        }

        try{
            await fetch('https://fcm.googleapis.com/fcm/send',{
                "method": 'POST',
                "headers":{
                    "Authorization":"key=" + "AAAAMGzW3sY:APA91bFkpmHZumZxoN-Sm7BOPYsnACLvmFc_WiR6WrbTRrWp6BdwfYvVBU4jBnhpdx0oZ2vb7gYswVAcgJX8DberZVai5MiCYMz9MEIb0gpskPpFIqtdxsyybAWdbYtOfDjKTj4fARmy",
                    "Content-Type": "application/json"
                },
                "body":JSON.stringify(notification_body)
            });

            console.log(`Alert Notification sended successfully`);
        }catch(err){
            console.log(err);
            return next(new HttpError('Alert Notification not sended', 500));
        }
    }

    res.json({report:reportFound.toObject({ getters: true })});
}

exports.getReportByDate = getReportByDate;
exports.addReport = addReport;