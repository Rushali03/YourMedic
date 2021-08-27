import React,{useState,useContext} from "react";
import {useHistory} from "react-router-dom";

import './AddSymptoms.css';
import {AuthContext} from "../../shared/context/AuthContext";
import Backdrop from "../../shared/UIElements/Backdrop";
import ErrorModal from "../../shared/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/UIElements/LoadingSpinner";

const AddSymptoms = () => {

    const auth = useContext(AuthContext);
    const history = useHistory();
    const [isLoading , setIsLoading] = useState(false);
    const [error , setError] = useState();

    const [showMedicineTags , setShowMedicineTags] = useState(false);
    const [symptoms,setSymptoms] = useState('');
    const [currentMedicines , setCurrentMedicines] = useState([]);

    const changeMedicineHandler = (event) => {
        const index = event.target.name;
        const change = String(event.target.className).split(' ')[0];
        const value = event.target.value;
        console.log(change);
        setCurrentMedicines(prev => {
            if(change === "medicine"){
                prev[index] = {
                    medicine:value,
                    startDate:prev[index].startDate
                }
            }else{
                prev[index] = {
                    medicine:prev[index].medicine,
                    startDate:value
                }
            }
            
            return [...prev]
        })  
    }

    const symptomsHandler = (event) => {
        const newSymptoms = event.target.value;
        setSymptoms(newSymptoms);
    }

    const addMedicineHandler = (event) => {
        event.preventDefault();
        const newCurrentMedicines = [...currentMedicines];
        newCurrentMedicines.push({
            medicine:"",
            startDate:""
        });
        setCurrentMedicines(newCurrentMedicines);
    }

    const submitHandler = async (event) => {
        event.preventDefault();
        console.log(symptoms,currentMedicines);
        try{
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/patient/addSymptomDetails/${auth.userId}`,{
                method:'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    symptoms:symptoms,
                    currentMedicines:currentMedicines
                })
            });
            const responseData = await response.json();
            if(responseData.message){
                throw new Error(responseData.message);
            }
            history.push("/showalldoctors");
        }catch(err){
            console.log(err);
            setError(err.message);
        }
        setIsLoading(false);
    }

    const showCurrentMedication = (event) => {
        event.preventDefault();
        setCurrentMedicines([
            {
                medicine:"",
                startDate:""
            },
            {
                medicine:"",
                startDate:""
            }
        ]);
        setShowMedicineTags(true);
    }

    const errorHandler = () => {
        setError(null);
    }

    return(
        <React.Fragment>
            <div id="bg-img">
                <div className="complete">
                    { error && (
                        <React.Fragment>
                            <Backdrop onClick={errorHandler} />
                            <ErrorModal heading="Error Occured!" error={error} />
                        </React.Fragment>
                    )}
                    { isLoading && <LoadingSpinner asOverlay />}

                    <form>
                        <h4 className="Question-Text">Your Problem/Symptoms</h4>
                        <textarea rows="3" value={symptoms} placeholder="Having cold,cough & fever ..." onChange={symptomsHandler}></textarea>

                        <h4 className="Question-Text">Do you have any Chronic Disease?</h4>
                        <button className="btn btn-success yes-btn" onClick={showCurrentMedication}><i class="fas fa-check-square"></i> Yes</button>
                        { showMedicineTags && (
                            <div>
                                <h6 className="Question-Text2">Include your current/previous medicines</h6>
                                {
                                    currentMedicines.map((med,index) => {
                                        return(
                                            <div key={index}>
                                                <input 
                                                    className="medicine form-control" 
                                                    type="text"
                                                    placeholder="Medicine Name" 
                                                    name={index} 
                                                    value={med.medicine} 
                                                    onChange={changeMedicineHandler}
                                                />
                                                <label className="since">Since</label>
                                                <input 
                                                    className="date form-control"
                                                    type="date"
                                                    name={index}
                                                    value={med.startDate}
                                                    onChange={changeMedicineHandler}
                                                />
                                                <hr></hr>
                                            </div>
                                        )
                                    })
                                }
                                <button className="btn btn-warning add-btn" onClick={addMedicineHandler}><i class="fas fa-plus"></i> Add</button>
                            </div>
                        )}
                        <button className="btn submit-btn" onClick={submitHandler} disabled={symptoms.length === 0 ? true:false}>Submit</button>
                    </form> 
                </div>
            </div>
        </React.Fragment>
    );
}

export default AddSymptoms;