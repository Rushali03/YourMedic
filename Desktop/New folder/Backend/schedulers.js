const cron = require("node-cron");
const Patient = require("./models/patient-model");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:"jdbhavsar213@gmail.com",
        pass: 'jaydev@385'
    }
});

cron.schedule("01 00 09 * * *", async () => {
    console.log("morningBeforeB");
    let patients;
    try{
        patients = await Patient.find().populate("prescribedMedicines");
    }catch(err){
        console.log(err);
        throw new Error("Somithing went wrong");
    }

    patients.forEach(async (patient) => {
        if(patient.prescribedMedicines.length > 0){
            let medicines = [];
            patient.prescribedMedicines.forEach(medicine => {
                if(medicine.time.morningBeforeB > 0){
                    medicines.push({name:medicine.name ,quantity:medicine.time.morningBeforeB});
                }
            });

            let mailOptions = {
                from:"jaydevbhavsar.ict18@gmail.com",
                to:`${patient.email}`,
                subject:"Medicine Time",
                text:`Please take this medicines before breakfast
                      ${medicines}`
            };
        
            transporter.sendMail(mailOptions, (err,info) => {
                if(err){
                    console.log(err);
                }else{
                    console.log("Email sent:" + info.response);
                }
            });
        }
    });
});

cron.schedule("01 00 10 * * *", async () => {
    console.log("morningAfterB");
    let patients;
    try{
        patients = await Patient.find().populate("prescribedMedicines");
    }catch(err){
        console.log(err);
        throw new Error("Somithing went wrong");
    }

    patients.forEach(async (patient) => {
        if(patient.prescribedMedicines.length > 0){
            let medicines = [];
            patient.prescribedMedicines.forEach(medicine => {
                if(medicine.time.morningAfterB > 0){
                    medicines.push({name:medicine.name ,quantity:medicine.time.morningAfterB});
                }
            });

            let mailOptions = {
                from:"jaydevbhavsar.ict18@gmail.com",
                to:`${patient.email}`,
                subject:"Medicine Time",
                text:`Please take this medicines after breakfast
                      ${medicines}`
            };
        
            transporter.sendMail(mailOptions, (err,info) => {
                if(err){
                    console.log(err);
                }else{
                    console.log("Email sent:" + info.response);
                }
            });
        }
    });
});

cron.schedule("01 00 12 * * *", async () => {
    console.log("afternoonBeforeL");
    let patients;
    try{
        patients = await Patient.find().populate("prescribedMedicines");
    }catch(err){
        console.log(err);
        throw new Error("Somithing went wrong");
    }

    patients.forEach(async (patient) => {
        if(patient.prescribedMedicines.length > 0){
            let medicines = [];
            patient.prescribedMedicines.forEach(medicine => {
                if(medicine.time.afternoonBeforeL > 0){
                    medicines.push({name:medicine.name ,quantity:medicine.time.afternoonBeforeL});
                }
            });

            let mailOptions = {
                from:"jaydevbhavsar.ict18@gmail.com",
                to:`${patient.email}`,
                subject:"Medicine Time",
                text:`Please take this medicines before lunch
                      ${medicines}`
            };
        
            transporter.sendMail(mailOptions, (err,info) => {
                if(err){
                    console.log(err);
                }else{
                    console.log("Email sent:" + info.response);
                }
            });
        }
    });
});

cron.schedule("01 00 13 * * *", async () => {
    console.log("afternoonAfterL");
    let patients;
    try{
        patients = await Patient.find().populate("prescribedMedicines");
    }catch(err){
        console.log(err);
        throw new Error("Somithing went wrong");
    }

    patients.forEach(async (patient) => {
        if(patient.prescribedMedicines.length > 0){
            let medicines = [];
            patient.prescribedMedicines.forEach(medicine => {
                if(medicine.time.afternoonAfterL > 0){
                    medicines.push({name:medicine.name ,quantity:medicine.time.afternoonAfterL});
                }
            });

            let mailOptions = {
                from:"jaydevbhavsar.ict18@gmail.com",
                to:`${patient.email}`,
                subject:"Medicine Time",
                text:`Please take this medicines after lunch
                      ${medicines}`
            };
        
            transporter.sendMail(mailOptions, (err,info) => {
                if(err){
                    console.log(err);
                }else{
                    console.log("Email sent:" + info.response);
                }
            });
        }
    });
});

cron.schedule("01 22 17 * * *", async () => {
    console.log("eveningBeforeD");
    let patients;
    try{
        patients = await Patient.find().populate("prescribedMedicines");
    }catch(err){
        console.log(err);
        throw new Error("Somithing went wrong");
    }

    patients.forEach(async (patient) => {
        if(patient.prescribedMedicines.length > 0){
            let medicines = [];
            patient.prescribedMedicines.forEach(medicine => {
                if(medicine.time.eveningBeforeD > 0){
                    medicines.push({name:medicine.name ,quantity:medicine.time.eveningBeforeD});
                }
            });

            // Medicines notification which should be sended to the patient
            let notification = {
                'title':`${patient.name} please take this medicines before dinner.`,
                'text':medicines
            }

            let mailOptions = {
                from:"jaydevbhavsar.ict18@gmail.com",
                to:`${patient.email}`,
                subject:"Medicine Time",
                text:`Please take this medicines before dinner
                      ${medicines}`
            };
        
            transporter.sendMail(mailOptions, (err,info) => {
                if(err){
                    console.log(err);
                }else{
                    console.log("Email sent:" + info.response);
                }
            });
        }
    });
});

cron.schedule("01 00 21 * * *", async () => {
    console.log("eveningAfterD");
    let patients;
    try{
        patients = await Patient.find().populate("prescribedMedicines");
    }catch(err){
        console.log(err);
        throw new Error("Somithing went wrong");
    }

    patients.forEach(async (patient) => {
        if(patient.prescribedMedicines.length > 0){
            let medicines = [];
            patient.prescribedMedicines.forEach(medicine => {
                if(medicine.time.eveningAfterD > 0){
                    medicines.push({name:medicine.name ,quantity:medicine.time.eveningAfterD});
                }
            });

            let mailOptions = {
                from:"jaydevbhavsar.ict18@gmail.com",
                to:`${patient.email}`,
                subject:"Medicine Time",
                text:`Please take this medicines after dinner
                      ${medicines}`
            };
        
            transporter.sendMail(mailOptions, (err,info) => {
                if(err){
                    console.log(err);
                }else{
                    console.log("Email sent:" + info.response);
                }
            });
        }
    });
});

