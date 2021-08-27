import React,{useState,useContext,useEffect} from "react";
import {useHistory,Link,useParams} from "react-router-dom";
import { Line } from 'react-chartjs-2';

import {AuthContext} from "../../shared/context/AuthContext";
import Backdrop from "../../shared/UIElements/Backdrop";
import ErrorModal from "../../shared/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/UIElements/LoadingSpinner";

const PatientHome = () => {

    const auth = useContext(AuthContext);
    const patientId = auth.userId;
    const history = useHistory();
    const [isLoading , setIsLoading] = useState(false);
    const [error , setError] = useState();

    const [patient, setPatient] = useState();
    const [dates , setDates] = useState();
    const [selectDate , setSelectDate] = useState();
    const [doctorName, setDoctorName] = useState();
    const [levels , setLevels] = useState({
        oxygenLevel:null,
        pulseLevel:null,   
        temperatureLevel:null
    })
    const [change, setChange] = useState(false);
    const [stateo , setStateo] = useState({
        labels: [],
        datasets: [
          {
            label: 'SpO2',
            fill: false,
            lineTension: 0.5,
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 2,
            data: []
          }
        ]
    });
    const [stateb , setStateb] = useState({
        labels: [],
        datasets: [
          {
            label: 'temperature',
            fill: false,
            lineTension: 0.5,
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 2,
            data: []
          }
        ]
    })
    const [statep , setStatep] = useState({
        labels: [],
        datasets: [
          {
            label: 'SpO2',
            fill: false,
            lineTension: 0.5,
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 2,
            data: []
          }
        ]
    });

    // To handle error
    const errorHandler = () => {
        setError(null);
    }

    const dateHandler = async (event) => {
        const newDate = event.target.value;
        setSelectDate(newDate);
        const findDateIndex = patient.reports.findIndex((report) => report.date === newDate);
        const xo = [];
        const yo = [];
        
        const xb = [];
        const yb = [];
        
        const xp = [];
        const yp = [];

        for (const re of patient.reports[findDateIndex].oxygen) {
            xo.push(re.time);
            yo.push(re.level);
        }
        const newStateo = {...stateo};
        newStateo.labels = xo;
        newStateo.datasets[0].data = yo;
        setStateo(newStateo);
        
        for (const re of patient.reports[findDateIndex].temperature) {
            xb.push(re.time);
            yb.push(re.level);
        }
        const newStateb = {...stateb};
        newStateb.labels = xb;
        newStateb.datasets[0].data = yb;
        setStateb(newStateb);
        
        for (const re of patient.reports[findDateIndex].pulse) {
            xp.push(re.time);
            yp.push(re.level);
        }
        const newStatep = {...statep};
        newStatep.labels = xp;
        newStatep.datasets[0].data = yp;
        setStatep(newStatep);
    }

    const levelHandler = (event) => {
        event.preventDefault();
        const category = event.target.name;
        const value = event.target.value;
        setLevels(prev => {
            if(category === "oxygen"){
                const newLevels = {...prev};
                newLevels.oxygenLevel = value;
                return newLevels;
            }else if(category === "temperature"){
                const newLevels = {...prev};
                newLevels.temperatureLevel = value;
                return newLevels;
            }else{
                const newLevels = {...prev};
                newLevels.pulseLevel = value;
                return newLevels;
            }
        });
    }

    const submitHandler = async (event) => {
        console.log(levels);
        try{
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/report/add/${patientId}`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    oxygenLevel:levels.oxygenLevel,
                    pulseLevel:levels.pulseLevel,
                    temperatureLevel:levels.temperatureLevel
                })
            });
            const responseData = await response.json();

            if(responseData.message){
                throw new Error(responseData.message); 
            }

            setLevels({
                oxygenLevel:null,
                pulseLevel:null,   
                temperatureLevel:null
            });
            setChange(prev => !prev);
        }catch(err){
            console.log(err);
            setError(err);
        }
        setIsLoading(false);

    }

    // get patient report from backend
    useEffect(() => {
        const sendRequest = async () => {
            try{
                setIsLoading(true);
                const response = await fetch(`http://localhost:8080/api/patient/info/${patientId}`);
                const responseData = await response.json();
                
                if(responseData.message){
                    throw new Error(responseData.message);
                }

                const doctor = responseData.patient.doctors.find(doctor => doctor.active);
                setDoctorName(doctor.name);
                
                if(responseData.patient.reports && responseData.patient.reports.length > 0){
                    let reportDates=[];
                    responseData.patient.reports.forEach((report) => {
                    reportDates.push(report.date)  
                    });
                    setDates(reportDates); 
                    setSelectDate(reportDates[reportDates.length-1]);

                    const xo = [];
                    const yo = [];
                    
                    const xb = [];
                    const yb = [];
                    
                    const xp = [];
                    const yp = [];

                    for (const re of responseData.patient.reports[responseData.patient.reports.length-1].oxygen) {
                        xo.push(re.time);
                        yo.push(re.level);
                    }
                    const newStateo = {...stateo};
                    newStateo.labels = xo;
                    newStateo.datasets[0].data = yo;
                    setStateo(newStateo);

                    for (const re of responseData.patient.reports[responseData.patient.reports.length-1].temperature) {
                        xb.push(re.time);
                        yb.push(re.level);
                    }
                    const newStateb = {...stateb};
                    newStateb.labels = xb;
                    newStateb.datasets[0].data = yb;
                    setStateb(newStateb);
                    
                    for (const re of responseData.patient.reports[responseData.patient.reports.length-1].pulse) {
                        xp.push(re.time);
                        yp.push(re.level);
                    }
                    const newStatep = {...statep};
                    newStatep.labels = xp;
                    newStatep.datasets[0].data = yp;
                    setStatep(newStatep);
                }

                setPatient(responseData.patient);
            }catch(err){
                console.log(err);
                setError(err);
            }
            setIsLoading(false);
        };
        sendRequest();
    }, [change]);

    return (
        <React.Fragment>
            { error && (
                <React.Fragment>
                    <Backdrop onClick={errorHandler} />
                    <ErrorModal heading="Error Occured!" error={error} />
                </React.Fragment>
            )}
            { isLoading && <LoadingSpinner asOverlay />}
            { !isLoading && patient && (
                <React.Fragment>
                    <div>
                        <h2>{patient.name} you are Consulted by Dr.{doctorName}</h2>
                        <hr />
                        <h4>Your Problem/Symptoms:</h4>
                        <h6>{patient && patient.symptoms}</h6>
                        <hr />
                        {(patient.currentMedicines && patient.currentMedicines.length > 0) ? (
                            <React.Fragment>
                                <h2>Current Medicine</h2>
                                {
                                    patient.currentMedicines.map((med, index) => {
                                    return (
                                        <div key={index}>
                                            <h5>Name: {med.medicine}</h5>
                                            <p>Start Date: { med.startDate}</p>
                                        </div>
                                    )
                                })
                                }
                            </React.Fragment>
                        ):null}
                        <hr />
                        {(patient.prescribedMedicines && patient.prescribedMedicines.length>0) ? (
                            <React.Fragment>
                                <h2>Prescribed Medicine</h2>
                                {
                                    patient.prescribedMedicines.map((med, index) => {
                                        return (
                                            <div key={index}>
                                                <h1>Name: {med.name}</h1>
                                                {(med.time.morningBeforeB + med.time.morningAfterB)>0 ? (
                                                  <h6>Morning: {med.time.morningBeforeB + med.time.morningAfterB}</h6>  
                                                ):null}
                                                {(med.time.afternoonBeforeL + med.time.afternoonAfterL)>0 ? (
                                                  <h6>:Afternoon: {med.time.afternoonBeforeL + med.time.afternoonAfterL}</h6>  
                                                ):null}
                                                {(med.time.eveningBeforeD + med.time.eveningAfterD)>0 ? (
                                                  <h6>Evening: {med.time.eveningBeforeD + med.time.eveningAfterD}</h6>  
                                                ):null}
                                            </div>
                                        )
                                    })
                                }
                            </React.Fragment>
                        ):(
                            <h4>Dr.{doctorName} has not prescribed medicines to you</h4>
                        )}
                        <hr />
                        {dates && (
                            <select value={selectDate} onChange={dateHandler}>
                                {
                                    dates.map((date) => {
                                        return(
                                            <option value={date}>{date}</option>
                                        )
                                    })
                                }
                            </select>
                        )}
                        <h2>SpO2 Level</h2>
                        <Line
                            data={stateo ? stateo : null}
                            options={{
                                title:{
                                display:true,
                                text:'Average SpO2 level per day',
                                fontSize:20
                                },
                                legend:{
                                display:true,
                                position:'right'
                                }
                            }}
                        />
                        <h5>Your current oxygen level:</h5>
                        <input type="number" placeholder="93" name="oxygen" value={levels.oxygenLevel} onChange={levelHandler}/>
                        <hr />
                        <h2>Body Temperature</h2>
                        <Line
                            style={{height:"25px",width:"25px"}}
                            data={stateb ? stateb : null}
                            options={{
                                title:{
                                display:true,
                                text:'Average SpO2 level per day',
                                fontSize:20
                                },
                                legend:{
                                display:true,
                                position:'right'
                                }
                            }}
                        />
                        <h5>Your current temperature:</h5>
                        <input type="number" placeholder="97" name="temperature" value={levels.temperatureLevel} onChange={levelHandler}/>
                        <hr />
                        <h2>Pulse</h2>
                        <Line
                            style={{height:"25px",width:"25px"}}
                            data={statep? statep : null}
                            options={{
                                title:{
                                display:true,
                                text:'Average SpO2 level per day',
                                fontSize:20
                                },
                                legend:{
                                display:true,
                                position:'right'
                                }
                            }}
                        />
                        <h5>Your current pulse rate:</h5>
                        <input type="number" placeholder="95" name="pulse" value={levels.pulseLevel} onChange={levelHandler}/>
                        <button onClick={submitHandler} disabled={!(!!levels.oxygenLevel && !!levels.temperatureLevel && !!levels.pulseLevel)}>
                            Submit
                        </button>
                    </div>
                </React.Fragment>
            )}
             
        </React.Fragment>
    )
}

export default PatientHome;