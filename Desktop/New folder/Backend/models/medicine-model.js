const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({

    name: { type: String, required: true },

    duration: { type: Number, required: true },

    active: { type: Boolean, required: true },

    patientId: { type: mongoose.Types.ObjectId, required: true, ref: 'Patient' },

    doctorId: { type: mongoose.Types.ObjectId, required: true, ref: 'Doctor' },

    time: {
        morningBeforeB: { type: Number },
        morningAfterB: { type: Number },
        afternoonBeforeL: { type: Number },
        afternoonAfterL: { type: Number },
        eveningBeforeD: { type: Number },
        eveningAfterD: { type: Number }
    }
});


module.exports = mongoose.model('Medicine', medicineSchema);