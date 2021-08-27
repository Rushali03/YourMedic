import React from "react";
import {Link} from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
    return(
        <React.Fragment>
            <div id="wrapper3">
                <div className="Question">
                    <div><h2 className="text">Your are?</h2></div>
                    <div className='links'>
                        <div className='doctor'>
                            <Link to="/auth/doctor" style={{textDecoration:'none', color:'black'}}>
                            <i className="fas fa-user-md"></i> DOCTOR
                            </Link>
                        </div>
                        <div className='patient'>
                            <Link to="/auth/patient" style={{textDecoration:'none', color:'black'}}>
                            <i className="fas fa-procedures"></i> PATIENT
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default HomePage;