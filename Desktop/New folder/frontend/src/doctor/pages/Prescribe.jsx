import React,{useState,useContext,useEffect} from "react";
import {useHistory,Link,useParams} from "react-router-dom";

import './Prescribe.css';
import {AuthContext} from "../../shared/context/AuthContext";
import Backdrop from "../../shared/UIElements/Backdrop";
import ErrorModal from "../../shared/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/UIElements/LoadingSpinner";

const Prescribe = () => {

    const patientId = useParams().patientId;
    const auth = useContext(AuthContext);
    const history = useHistory();
    const [isLoading , setIsLoading] = useState(false);
    const [error , setError] = useState();
    const [patient , setPatient] = useState();

    const medicine = {
        name: '',
        duration: 0,
        time: {
            morningBeforeB: 0,
            morningAfterB: 0,
            afternoonBeforeL: 0,
            afternoonAfterL: 0,
            eveningBeforeD: 0,
            eveningAfterD: 0
        }
    }
    const [medicines, setMedicines] = useState([medicine]);
    const [morning, setMorning] = useState('morningBeforeB');
    const [afternoon, setAfternoon] = useState('afternoonBeforeB');
    const [evening, setEvening] = useState('eveningBeforeB');


    function addMedicine(){
        setMedicines([...medicines, medicine]);
    }

    function handleClick(e, index) {
        if (e.target.id === 'name') {
            const newMed = [...medicines];
            newMed[index].name = e.target.value;
            setMedicines(newMed);
        }
        else if (e.target.id === 'duration') {
            const newMed = [...medicines];
            newMed[index].duration = Number(e.target.value);
            setMedicines(newMed);
        }
        else if (e.target.id === 'morning') {
            if (morning === 'morningBeforeB') {
                const newMed = [...medicines];
                newMed[index].time.morningBeforeB = Number(e.target.value);
                newMed[index].time.morningAfterB = 0;
                setMedicines(newMed);
                
            } else {
                const newMed = [...medicines];
                newMed[index].time.morningAfterB = Number(e.target.value);
                newMed[index].time.morningBeforeB = 0;
                setMedicines(newMed);
            }
        }
        else if (e.target.id === 'afternoon') {
            if (afternoon === 'afterNoonbeforeL') {
                const newMed = [...medicines];
                newMed[index].time.afternoonBeforeL = Number(e.target.value);
                newMed[index].time.afternoonAfterL = 0;
                setMedicines(newMed);
                
            } else {
                const newMed = [...medicines];
                newMed[index].time.afternoonAfterL = Number(e.target.value);
                newMed[index].time.afternoonBeforeL = 0;
                setMedicines(newMed);
            }
        }
        else if (e.target.id === 'evening') {
            if (evening === 'eveningBeforeD') {
                const newMed = [...medicines];
                newMed[index].time.eveningBeforeD = Number(e.target.value);
                newMed[index].time.eveningAfterD = 0;
                setMedicines(newMed);
                
            } else {
                const newMed = [...medicines];
                newMed[index].time.eveningAfterD = Number(e.target.value);
                newMed[index].time.eveningBeforeD = 0;
                setMedicines(newMed);
            }
        }
    }

    const PrescribeMed = medicines.map((med, index) => {
        return (
            <div key={index}>
                <form>
                    <label className="medicine-label">Medicine Name</label>
                    <input className="form-control medicine-input" type="text" id="name" value={med.name} onChange={(e) => handleClick(e, index)}/>
                    
                    <label className="medicine-label">Duration</label>
                    <input className="form-control medicine-input" type="number" id="duration" value={med.duration} onChange={(e) => handleClick(e, index)}/>
            
                    <label className="medicine-label">Morning</label>
                    <select value={morning} onChange={(e) => setMorning(e.target.value)}>
                        <option value="morningBeforeB">Before BreakFast</option>
                        <option value="morningBfterB">After BreadFast</option>
                    </select>
                    <input 
                        type="number" 
                        id="morning" 
                        className="form-control medicine-input"
                        value={morning === 'morningBeforeB' ? med.time.morningBeforeB : med.time.morningAfterB} 
                        onChange={(e) => handleClick(e, index)}
                    />

                    <label className="medicine-label">Afternoon</label>
                    <select value={afternoon} onChange={(e) => setAfternoon(e.target.value)}>
                        <option value="afternoonBeforeL">Before Lunch</option>
                        <option value="afternoonAfterL">After Lunch</option>
                    </select>
                    <input 
                        type="number" 
                        id="afternoon" 
                        className="form-control medicine-input"
                        value={afternoon === 'afternoonBeforeL' ? med.time.afternoonBeforeL : med.time.afternoonAfterL} 
                        onChange={(e) => handleClick(e, index)}
                    />

                    <label className="medicine-label">Evening</label>
                    <select value={evening} onChange={(e) => setEvening(e.target.value)}>
                        <option value="eveningBeforeD">Before Dinner</option>
                        <option value="eveningAfterD">After Dinner</option>
                    </select>
                    <input 
                        type="number" 
                        id="evening" 
                        className="form-control medicine-input"
                        value={evening === 'eveningBeforeD' ? med.time.eveningBeforeD : med.time.eveningAfterD} 
                        onChange={(e) => handleClick(e, index)}
                    />
                </form>
            </div>
        )
    });

    const errorHandler = () => {
        setError(null);
    }

    const submitHandler = async (event) => {
        event.preventDefault();
        try{
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/medicine/add`,{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    doctorId:auth.userId,
                    patientId:patientId,
                    medicines:medicines,    
                })
            });
            const responseData = await response.json();
            if(responseData.message !== "medicine added successfully"){
                throw new Error(responseData.message);
            }
            history.push(`/patient/${patientId}`);
        }catch(err){
            console.log(err);
            setError(err.message);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        const sendRequest = async () => {
            try{
                setIsLoading(true);
                const response = await fetch(`http://localhost:8080/api/patient/info/${patientId}`);
                const responseData = await response.json();     
                
                if(responseData.message){
                    throw new Error(responseData.message);
                }
                
                setPatient(responseData.patient);
            }catch(err){
                console.log(err);
                setError(err.message);
            }
            setIsLoading(false);
        };
        sendRequest();
    },[])

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
                   <div className="patient-details">
                    <h2 className="patient-name"><i class="fas fa-user-circle"></i> {patient.name} <p className="patient-gender">{patient.gender === "Male" ?<i class="fas fa-mars"></i> : <i class="fas fa-venus"></i>} </p></h2>
                    <p className="patient-city">{patient.city}, {patient.state}</p>
                </div>

                <div className="patient-problem">
                    <h3 style={{color:'#1E56A0', fontWeight:'700'}}>Patient's Problem</h3>
                    <p style={{fontSize:'1.3rem'}}>{patient.symptoms}</p>
                </div>

                <div className="patient-medication">
                    {(patient.currentMedicines && patient.currentMedicines.length > 0) ? (
                        <React.Fragment>
                            <h3 style={{color:'#1E56A0', fontWeight:'700'}}>Patient's Current Medication</h3>
                            {patient.currentMedicines.map(m => {
                                return(
                                    <p><span style={{color:'grey', fontWeight:'600', fontStyle:'italic'}}>Medicine Name</span> <span style={{color:'purple', fontWeight:'600', fontSize:'1.2rem'}}>{m.medicine}</span> 
                                    <span style={{color:'grey', fontWeight:'600', fontStyle:'italic'}}> since </span> <span style={{color:'purple', fontWeight:'600', fontSize:'1.2rem'}}>{m.startDate}</span></p>
                                )
                            })}
                        </React.Fragment>
                    ):(
                        <h3 style={{color:'#1E56A0', fontWeight:'700'}}>Patient is not having any chronic diseases or current medication</h3>
                    ) }                              
                </div>                   
                <div className="medicinesDIV">
                    <h1 style={{color:'#554674', fontWeight:'700'}}><i class="fas fa-capsules"></i> Medicines</h1>
                    {PrescribeMed}
                    <button className="btn btn-warning add-btn2" onClick={addMedicine}><i class="fas fa-plus"></i> Add</button>
                    <button className="btn btn-primary submit-btn2" onClick={submitHandler}>Submit</button>       
                </div>
                </React.Fragment>
            )}
        </React.Fragment>
    )
}

export default Prescribe