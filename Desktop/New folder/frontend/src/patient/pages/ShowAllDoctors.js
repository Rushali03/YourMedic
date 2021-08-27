import React,{useState,useContext, useEffect} from "react";
import {useHistory} from "react-router-dom";

import "./ShowAllDoctors.css";
import BackgroungImg from '../../Photos/DrListGg.jpg';
import {AuthContext} from "../../shared/context/AuthContext";
import Backdrop from "../../shared/UIElements/Backdrop";
import ErrorModal from "../../shared/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/UIElements/LoadingSpinner";
import DrM from '../../Photos/Dr_M.svg';
import DrF from '../../Photos/Dr_F.svg';

const ShowAllDoctors = () => {

    const auth = useContext(AuthContext);
    const history = useHistory();
    const [isLoading , setIsLoading] = useState(false);
    const [error , setError] = useState();
    const [popup , setPopup] = useState();

    const [doctors , setDoctors] = useState();
    const [showAllDoctors , setShowAllDoctors] = useState(true);

    // To handle error
    const errorHandler = () => {
        setError(null);
        setPopup(null);
    }

    const getDoctosNearBy = async () => {
        if(showAllDoctors){
            try{
                setIsLoading(true);
                const response = await fetch(`http://localhost:8080/api/patient/doctorsNearBy/${auth.userId}`);
                const responseData = await response.json();
    
                if(responseData.message){
                    throw new Error(responseData.message);
                }
    
                setDoctors(responseData.doctors);
            }catch(err){
                console.log(err);
                setError(err.message);
            }
            setIsLoading(false);
        }else{
            try{
                setIsLoading(true);
                const response = await fetch("http://localhost:8080/api/doctor/all");
                const responseData = await response.json();

                if(responseData.message){
                    throw new Error(responseData.message);
                }

                setDoctors(responseData.doctors);
            }catch(err){
                console.log(err);
                setError(err.message);
            }
            setIsLoading(false);
        }
        setShowAllDoctors(pre => !pre);
    }

    const sendConsultRequest = async (doctorId,doctorName) => {
        try{
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/patient/consultdoctor`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientId:auth.userId,
                    doctorId:doctorId
                })
            });
            const responseData = await response.json();

            if(responseData.message){
                throw new Error(responseData.message);
            }

            setPopup(`Your request has been sended to Dr.${doctorName},You will get an email when he confirms it.`);
        }catch(err){
            console.log(err);
            setError(err.message);
        }
    }

    const goToHome = () => {
        history.push("/");
    }

    useEffect(() => {
        const sendRequest = async () => {
            try{
                setIsLoading(true);
                const response = await fetch("http://localhost:8080/api/doctor/all");
                const responseData = await response.json();

                if(responseData.message){
                    throw new Error(responseData.message);
                }

                setDoctors(responseData.doctors);
            }catch(err){
                console.log(err);
                setError(err.message);
            }
            setIsLoading(false);
        }
        sendRequest();
    },[])

    return(
        <React.Fragment>
            { popup && (
                <React.Fragment>
                    <Backdrop onClick={errorHandler} />
                    <ErrorModal heading="Message" error={popup} button={true} handleButton={goToHome}/>
                </React.Fragment>
            )}
            { error && (
                <React.Fragment>
                    <Backdrop onClick={errorHandler} />
                    <ErrorModal heading="Error Occured!" error={error} />
                </React.Fragment>
            )}
            { isLoading && <LoadingSpinner asOverlay />}

            <div style={{backgroundImage: `url(${BackgroungImg})`,backgroundSize:"contain", minHeight:"100%"}}>
                <p className="Title" style={{float:"left",backgroundImage: `url(${BackgroungImg})`,fontSize:"4em"}}>List of Doctors</p>
                <div style={{clear:"both"}}>
                    <button className="NearByBtn" onClick={getDoctosNearBy}>{showAllDoctors ? "Get doctors near by" : "Show all doctors"}</button>
                </div>

                { !isLoading && doctors && (
                    doctors.map(doctor => {
                        return(
                            <React.Fragment>                   
                                <div key={doctor.id} className="DocBox container" style={{background:"white" ,boxShadow:"rgba(0, 0, 0, 0.24) 2px 8px 20px",clear:"both",paddingTop:"2%",padding:"1% 3% 1%",margin:"1% 10% 1%",width:"80%",borderRadius:"15px"}}> 
                                    <div className="row">
                                        <div className="col-2">
                                            <div className="row">
                                                {doctor.gender==="Male" ? <img style={{width: 80,height: 80,borderRadius:100}} src={DrM} alt="Male Dr." /> : <img style={{width: 80,height: 55,borderRadius:80}} src={DrF} alt="Female Dr." /> }
                                            </div>
                                            <div className="row">
                                                <h5>{doctor.name}</h5>      
                                            </div>
                                        </div>                
                                        <div className="col-5">
                                            <div class="row">
                                                <p>Designation: {doctor.designation}</p>
                                            </div>
                                            <div class="row">
                                                <p>Email: {doctor.email}</p>
                                            </div>
                                            <div class="row">
                                                <p>Contact No.: {doctor.phoneNo}</p>
                                            </div>
                                            <div class="row">
                                                <p>Current Patients: {doctor.currentPatientsLength}</p>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="row">
                                                <p>City: {doctor.city}</p>
                                            </div>
                                            <div class="row">
                                                <p>State: {doctor.state}</p>                           
                                            </div>
                                            <button className="ConsultBtn" style={{display:"inline-block"}} onClick={() => sendConsultRequest(doctor.id,doctor.name)}>Consult</button>         
                                        </div>
                                    </div>                
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
            </div>
        </React.Fragment>
    );
}

export default ShowAllDoctors;