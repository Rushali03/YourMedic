import React,{useState,useContext} from 'react';
import {NavLink} from 'react-router-dom';

import "./Navbar.css";
import {AuthContext} from "../context/AuthContext";

const Navbar = () => {

    // const [search,setSearch] = useState("");
    const auth = useContext(AuthContext);

    // function handleSearch(event){
    //     const ipValue = event.target.value;
    //     searchkey(ipValue);
    //     setSearch(ipValue);
    // }

    // function handleClick(){
    //     // alert("Search: " + search);
    //     setSearch("");
    // }
    
    // function searchkey(search) {
    //     let filter = search.toUpperCase();
    //     let title = document.querySelectorAll("h4.question-title");
    //     for (let i = 0; i < title.length; i++) {
    //         let h4 = document.querySelectorAll("h4.question-title")[i];
    //         if (h4) {
    //             let textValueh = h4.textContent;
    
    //             if (textValueh.toUpperCase().indexOf(filter) > -1) {
    //                 document.querySelectorAll("div.question-container")[i].style.display = "";
    //             } else {
    //                 document.querySelectorAll("div.question-container")[i].style.display = "none";
    //             }
    //         }
    //     }
    
    // }
 
    return(
        <div>
            <nav className="navbar navbar-expand-lg navbar-dark">
            <a className="navbar-brand" href="#">
                {/* <span style={{color: "red"}}>M</span>edister */}
                YourMedic
            </a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
                    <ul className="nav nav-pills justify-content-right">
                        
                        { auth.isPatient && (
                            <React.Fragment>                            
                                <li className="nav-item">
                                    <NavLink to="/showalldoctors" className="nav-link" exact>
                                        Doctors
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/addsymptoms" style={{textDecoration:"none"}} className="nav-link" exact>
                                        Add Symptoms
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/patient/home" style={{textDecoration:"none"}} className="nav-link" exact>
                                        Home
                                    </NavLink>
                                </li>
                            </React.Fragment>
                        )}
                            
                         { !auth.isPatient && (
                            <React.Fragment>                            
                                <li className="nav-item">
                                    <NavLink to="/patients" className="nav-link" exact>
                                        Patients
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/consultrequests" style={{textDecoration:"none"}} className="nav-link" exact>
                                        Requests
                                    </NavLink>
                                </li>
                            </React.Fragment>
                         )}
                    </ul>
                </div>
            </nav>
        </div>
    )
}

export default Navbar;