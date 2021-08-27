import {createContext} from 'react';

export const AuthContext = createContext(
    {
        isLogedIn:false,
        isPatient:true,
        userId:null,
        token:null,
        login:() => {},
        logout:() => {}
    }
);