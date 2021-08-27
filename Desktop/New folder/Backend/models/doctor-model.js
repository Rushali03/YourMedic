const mongoose = require("mongoose");

const uniqueValidator = require('mongoose-unique-validator');

const doctorSchema = new mongoose.Schema({
    
    name:{type:String , required:true},

    email:{type:String , required:true , unique:true},

    password:{type:String , required:true}, 

    phoneNo:{type:Number , required:true , unique:true},

    city:{ type:String , required:true },

    state:{ type:String , required:true },

    gender:{ type:String , required:true },

    doctorLicense:{type:String , required:true},

    designation:{type:String , required:true},

    patientIds:[{ type:mongoose.Types.ObjectId ,required:true, ref:'Patient' }],

    patients:[{
        patientId:{type:String},
        consulted:{type:Boolean},
        active:{type:Boolean },
        startDate:{type:String },
        endDate:{type:String }
    }]
});

doctorSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Doctor',doctorSchema);