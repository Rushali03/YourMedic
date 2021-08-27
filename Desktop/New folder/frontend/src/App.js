import './App.css';
import React,{useCallback,useState} from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
 } from "react-router-dom";

import {AuthContext} from "./shared/context/AuthContext";
import HomePage from "./authentication/HomePage";
import PatientAuth from "./authentication/PatientAuth";
import DoctorAuth from "./authentication/DoctorAuth";
import ShowAllDoctors from "./patient/pages/ShowAllDoctors";
import PatientHome from "./patient/pages/PatientHome";
import GetPatients from './doctor/pages/GetPatients';
import ConsultRequests from './doctor/pages/CosultRequests';
import AddSymptoms from "./patient/pages/AddSymptoms";
import Prescribe from './doctor/pages/Prescribe';
import PatientPage from './doctor/pages/PatientPage';
import Navbar from "./shared/components/Navbar";

const App = () => {

  const [isLogedIn , setIsLogedIn] = useState(false);
  const [isPatient , setIsPatient] = useState(true);
  const [userId , setUserId] = useState();
  const [token , setToken] = useState();

  const login = useCallback((userId,token,isPatient) => {
    setIsLogedIn(true);
    setUserId(userId);
    setToken(token);
    setIsPatient(isPatient);
  },[]);

  const logout = useCallback((userId) => {
    setIsLogedIn(false);
    setUserId(null);
    setToken(null);
    setIsPatient(null);
  },[]);

  let routes;
  if(isLogedIn){
    if(!isPatient){
      routes = (
        <Switch>
          <Route path="/patients" exact>
            <Navbar />
            <GetPatients />
          </Route>

          <Route path="/consultrequests" exact>
            <Navbar />
            <ConsultRequests />
          </Route>

          <Route path="/prescribe/medicine/:patientId" exact>
            <Navbar />
            <Prescribe />
          </Route>

          <Route path="/patient/:patientId" exact>
            <Navbar />
            <PatientPage />
          </Route>
  
          <Redirect to="/patients" />
        </Switch>
      )
    }else{
      routes = (
        <Switch>
          <Route path="/showalldoctors" exact>
            <Navbar />
            <ShowAllDoctors />
          </Route>
  
          <Route path="/addsymptoms" exact>
            <Navbar />
            <AddSymptoms />
          </Route>
  
          <Route path="/patient/home" exact>
            <Navbar />
            <PatientHome />
          </Route>
  
          <Redirect to="/showalldoctors" />
        </Switch>
      )
    }
  }else{
    routes = (
      <Switch>
            <Route path="/" exact>
              <HomePage />
            </Route>

            <Route path="/auth/doctor" exact>
              <DoctorAuth />
            </Route>

            <Route path="/auth/patient" exact>
              <PatientAuth />
            </Route>
            
            <Redirect to="/" />
      </Switch>
    )
  }

  return(
    <AuthContext.Provider value={{
      isLogedIn:isLogedIn,
      isPatient:isPatient,
      userId:userId,
      token:token,
      login:login,
      logout:logout
    }}>
      <Router>
        {routes}
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
