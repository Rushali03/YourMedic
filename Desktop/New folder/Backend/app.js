const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

const HttpError = require("./util/http-error");
const patientRoutes = require("./routes/patient-routes");
const doctorRoutes = require("./routes/doctor-routes");
const medicineRoutes = require("./routes/medicine-routes");
const reportRoutes = require("./routes/report-routes");

app.use(bodyParser.json());

app.use((req,res,next) => {
    // Header used to patch the backend with Frontend
    // It will allow the access form any browser NOT ONLY localhost:3000
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE');
    next();
});

app.use("/api/patient",patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/medicine",medicineRoutes);
app.use("/api/report",reportRoutes)

app.use((req,res,next) => {
    const error = new HttpError('Could not find the route!',404);
    next(error);
})

app.use((error,req,res,next) => {
    // If the response is already given
    if(res.headerSent){
        return next(error);
    }
    res.status(error.code || 500)
    res.json({message:error.message || 'An unknown error found!'});
})

mongoose
    .connect("mongodb+srv://innoventx:innoventx123@cluster0.bhow9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{ useNewUrlParser: true,useUnifiedTopology: true  })
    .then(() => {
        app.listen(8080,() => {
            console.log("server listening at 8080");
            const core = require("./schedulers");
        });
    })
    .catch((err) => {
        console.log(err);
    })
