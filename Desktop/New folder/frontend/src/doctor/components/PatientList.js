import React from "react";

import Patient from "./Patient";

const PatientList = (props) => {
    return(
        <React.Fragment>
        {
            props.patients.map(patient => {
                return(
                    <Patient 
                        key={patient.id}
                        id={patient.id}
                        name={patient.name}
                        active={patient.active}
                        startDate={patient.startDate}
                        endDate={patient.endDate}
                        phoneNo={patient.phoneNo}
                        city={patient.city}
                        state={patient.state}
                        gender={patient.gender}
                        prescribedMedicines={patient.prescribedMedicines}
                    />
                )
            })
        }
        </React.Fragment>
    );
}

export default PatientList;