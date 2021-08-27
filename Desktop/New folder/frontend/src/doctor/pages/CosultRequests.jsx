import React,{useState,useContext,useEffect} from "react";
import {useHistory} from "react-router-dom";

import "./ConsultRequests.css";
import BackgroungImg from '../../Photos/DrListGg.jpg';
import DrM from '../../Photos/Dr_M.svg';
import DrF from '../../Photos/Dr_F.svg';
import {AuthContext} from "../../shared/context/AuthContext";
import Backdrop from "../../shared/UIElements/Backdrop";
import ErrorModal from "../../shared/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/UIElements/LoadingSpinner";

import "./ConsultRequests.css";
import BgImg from '../../Photos/DesktopBg.png';
import PntM from '../../Photos/Pnt_M.svg';
import PntF from '../../Photos/Pnt_F.svg';

const ConsultRequests = () => {

    const auth = useContext(AuthContext);
    const history = useHistory();
    const [isLoading , setIsLoading] = useState(false);
    const [error , setError] = useState();
    const [popup , setPopup] = useState();

    const [patients, setPatients] = useState();
    const [listChange , setListChange] = useState(false);

    const accept = async (patientId,patientName) => {
        try{
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/doctor/confirm/patient/${auth.userId}`,{
                method: 'PATCH',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientId: patientId
                })
            });
            const responseData = await response.json();

            if(responseData.message){
                throw new Error(responseData.message);
            }

            setPopup(`${patientName}'s request is been confirmed`);
            history.push(`/prescribe/medicine/${patientId}`);
        }catch(err){
            console.log(err);
            setError(err.message);
        }
        setIsLoading(false);
        setListChange(pre => !pre);
    }

    const reject = async (patientId,patientName) => {
        try{
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/doctor/reject/patient/${auth.userId}`,{
                method: 'PATCH',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientId: patientId
                })
            });
            const responseData = await response.json();

            if(responseData.message){
                throw new Error(responseData.message);
            }

            setPopup(`${patientName}'s request is been rejected`);
        }catch(err){
            console.log(err);
            setError(err.message);
        }
        setIsLoading(true);
        setListChange(pre => !pre);
    }

    const errorHandler = () => {
        setError(null);
        setPopup(null);
    }

    // get patients from backend
    useEffect(() => {
        const sendRequest = async () => {
            try{
                setIsLoading(true);
                const response = await fetch(`http://localhost:8080/api/doctor/nonConsulted/patients/${auth.userId}`);
                const responseData = await response.json();     
                
                if(responseData.message){
                    throw new Error(responseData.message);
                }
                
                setPatients(responseData.patients);
            }catch(err){
                console.log(err);
                setError(err.message);
            }
            setIsLoading(false);
        };
        sendRequest();
    }, [listChange]);

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

            { !isLoading && patients && (
                <React.Fragment>
                    { patients.length > 0 ? (
                        <p className="Title" style={{float:"left",backgroundImage: `url(${BackgroungImg})`,fontSize:"4em"}}>Nonconsulted Patients</p>    
                    ):(
                        <p className="Title" style={{float:"left",backgroundImage: `url(${BackgroungImg})`,fontSize:"4em"}}>No Nonconsulted Patients</p>
                    )}                                            
                    {
                        patients.map(patient => {
                            return (
                                <div key={patient.id} className="DocBox container" style={{background:"white" ,boxShadow:"rgba(0, 0, 0, 0.24) 2px 8px 20px",clear:"both",paddingTop:"2%",padding:"1% 3% 1%",margin:"1% 10% 1%",width:"80%",borderRadius:"15px"}}> 
                                    <div className="row">                    
                                        <div className="col-2">
                                            {/*<div className="row">
                                                {props.gender==="Male" ? <img style={{width: 80,height: 80,borderRadius:100}} src={DrM} alt="Male Patient" /> : <img style={{width: 80,height: 55,borderRadius:80}} src={DrF} alt="Female Patient" /> }
                                            </div>*/}
                                            <div className="row">
                                                <h5>{patient.name}</h5>      
                                            </div>
                                            <div class="col-4">
                                                <div class="row">
                                                    <p>Location: {patient.city}, {patient.state}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row justify-content-md-center">    
                                            <div class="col-6">
                                                <button style={{display:"inline-block",float:"right"}} className="btn btn-success AcceptBtn col-4" onClick={() => accept(patient.id, patient.name)}>Accept</button>    
                                            </div>               
                                            <div class="col-6">
                                                <button style={{display:"inline-block",float:"left"}} className="btn btn-danger RejectBtn col-4" onClick={() => reject(patient.id, patient.name)}>Reject</button>                                 
                                            </div>                                                                                                  
                                        </div>                                                

                                    </div>
                                    <div className="row justify-content-md-center">    
                                        <div class="col-6">
                                            <button style={{display:"inline-block",float:"right"}} className="AcceptBtn col-4" onClick={() => accept(patient.id, patient.name)}>Accept</button>    
                                        </div>               
                                        <div class="col-6">
                                            <button style={{display:"inline-block",float:"left"}} className="RejectBtn col-4" onClick={() => reject(patient.id, patient.name)}>Reject</button>                                 
                                        </div>                                                                                                  
                                    </div>
                                </div>
                            )
                        })
                    }
                </React.Fragment>
            )}
        </React.Fragment>
    )

}

export default ConsultRequests;
