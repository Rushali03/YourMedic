import React,{useState,useContext,useEffect} from "react";
import {useHistory,Link,useParams} from "react-router-dom";
import { Line } from 'react-chartjs-2';

import {AuthContext} from "../../shared/context/AuthContext";
import Backdrop from "../../shared/UIElements/Backdrop";
import ErrorModal from "../../shared/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/UIElements/LoadingSpinner";

const PatientPage = () => {

    const patientId = useParams().patientId;
    const auth = useContext(AuthContext);
    const history = useHistory();
    const [isLoading , setIsLoading] = useState(false);
    const [error , setError] = useState();
    const [report, setReport] = useState();
    const [dates , setDates] = useState();
    const [selectDate , setSelectDate] = useState();
    const [popup , setPopup] = useState();

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
        setPopup(null);
    }

    const dateHandler = async (event) => {
        const newDate = event.target.value;
        setSelectDate(newDate);
        const findDateIndex = report.reports.findIndex((report) => report.date === newDate);
        const xo = [];
        const yo = [];
        
        const xb = [];
        const yb = [];
        
        const xp = [];
        const yp = [];

        for (const re of report.reports[findDateIndex].oxygen) {
            xo.push(re.time);
            yo.push(re.level);
        }
        const newStateo = {...stateo};
        newStateo.labels = xo;
        newStateo.datasets[0].data = yo;
        setStateo(newStateo);
        
        for (const re of report.reports[findDateIndex].temperature) {
            xb.push(re.time);
            yb.push(re.level);
        }
        const newStateb = {...stateb};
        newStateb.labels = xb;
        newStateb.datasets[0].data = yb;
        setStateb(newStateb);
        
        for (const re of report.reports[findDateIndex].pulse) {
            xp.push(re.time);
            yp.push(re.level);
        }
        const newStatep = {...statep};
        newStatep.labels = xp;
        newStatep.datasets[0].data = yp;
        setStatep(newStatep);
    }

    const endMedicationHandler = async () => {
        try{
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/doctor/completed/medication/${auth.userId}`,{
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientId:patientId
                })
            });
            const responseData = await response.json();

            if(responseData.message){
                throw new Error(responseData.message); 
            }

            setPopup(`You have ended ${report.name}'s medication`);
            history.push("/patients");
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

                setReport(responseData.patient);
            }catch(err){
                console.log(err);
                setError(err);
            }
            setIsLoading(false);
        };
        sendRequest();
    }, []);

    return (
        <React.Fragment>
            { popup && (
                <React.Fragment>
                    <Backdrop onClick={errorHandler} />
                    <ErrorModal heading="Message" error={popup} button={true} handleButton={errorHandler}/>
                </React.Fragment>
            )}
            { error && (
                <React.Fragment>
                    <Backdrop onClick={errorHandler} />
                    <ErrorModal heading="Error Occured!" error={error} />
                </React.Fragment>
            )}
            { isLoading && <LoadingSpinner asOverlay />}
            { !isLoading && report && (
                <React.Fragment>
                    <div>
                        <h2>Patient Name: {report.name}</h2>
                        <button onClick={endMedicationHandler}>End medication</button>
                        <hr />
                        <h2>Patient Problem:</h2>
                        <p>{report && report.symptoms}</p>
                        <hr />
                        {(report.currentMedicines && report.currentMedicines.length > 0) ? (
                            <React.Fragment>
                                <h2>Current Medicine</h2>
                                {
                                report.currentMedicines.map((med, index) => {
                                    return (
                                        <div key={index}>
                                            <h1>Name: {med.medicine}</h1>
                                            <h2>Start Date: { med.startDate}</h2>
                                        </div>
                                    )
                                })
                                }
                            </React.Fragment>
                        ):(
                            <h4>Patient does not have any cronic deseases or current medication</h4>
                        )}
                        <hr />
                        <h2>Prescribed Medicine</h2>
                        {
                            report.prescribedMedicines.map((med, index) => {
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
                        <hr />
                        {dates ? (
                            <React.Fragment>
                                <select value={selectDate} onChange={dateHandler}>
                                    {
                                        dates.map((date) => {
                                            return(
                                                <option value={date}>{date}</option>
                                            )
                                        })
                                    }
                                </select>
                                <h2>SpO2 Level</h2>
                                <Line
                                    data={stateo}
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
                                <hr />
                                <h2>Body Temperature</h2>
                                <Line
                                    style={{height:"25px",width:"25px"}}
                                    data={stateb}
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
                                <hr />
                                <h2>Pulse</h2>
                                <Line
                                    style={{height:"25px",width:"25px"}}
                                    data={statep}
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
                            </React.Fragment>
                        ):(
                            <h2>Patient have no current reports</h2>
                        )}
                    </div>
                </React.Fragment>
            )}
             
        </React.Fragment>
    )
}

export default PatientPage;