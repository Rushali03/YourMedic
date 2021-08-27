const mongoose = require("mongoose");

const uniqueValidator = require('mongoose-unique-validator');

const reportSchema = new mongoose.Schema({

    dateId:{type:String , required:true , unique:true},
    
    patientId:{ type:String , required:true },

    patientName:{type:String , required:true },

    doctorId:{ type:String , required:true },

    doctorName:{ type:String , required:true },

    date:{type:String , required:true},


    // morning:[{
    //     medicineName:{type:String},
    //     quantity:{type:Number}
    // }],

    // afternoon:[{
    //     medicineName:{type:String},
    //     quantity:{type:Number}
    // }],

    // evening:[{
    //     medicineName:{type:String},
    //     quantity:{type:Number}
    // }],

    oxygen:[{
        level:{type:Number},
        time:{type:Number}
    }],

    pulse:[{
        level:{type:Number},
        time:{type:Number}
    }],

    temperature: [{
        level:{type:Number},
        time:{type:Number}
    }]

});

reportSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Report',reportSchema);