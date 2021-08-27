import React,{useReducer,useEffect} from 'react';

import './Input.css';
import {validate} from './validators';

const inputReducer = (state,action) => {
    switch (action.type){
        case 'CHANGE' : return{
            ...state,
            value:action.val,
            isValid:validate(action.val , action.validators)
        };
        case 'TOUCH' : return{
            ...state,
            isTouch: true
        }
        default :
            return state
    }
}

const Input = (props) => {

    const [inputState,dispatch] = useReducer(inputReducer,
        { 
            value: props.value || '' , 
            isValid:props.valid || false , 
            isTouch:false 
        }
    );

    const { id, onInput } = props;
    const { value,isValid} = inputState;

    useEffect(() => {
        onInput(id,value,isValid)
    },[id,value,isValid,onInput]);
    
    const changeHandler = (event) => {
        dispatch({type:'CHANGE', val:event.target.value , validators:props.validators})
    }

    const touchHandeler = () => {
        dispatch({
            type:'TOUCH'
        });
    }
    

    const element = 
        props.element === 'input' ? (
            <input 
                id={props.id} 
                type={props.type} 
                placeholder={props.placeholder} 
                onChange={changeHandler}
                onBlur={touchHandeler} 
                value={inputState.value}/>
        ) : (
            <textarea 
                id={props.id} 
                rows={props.rows || 3} 
                onChange={changeHandler} 
                onBlur={touchHandeler}
                value={inputState.value} />
        );
        

    return(
        <div className={`form-control ${!inputState.isValid && inputState.isTouch && 'form-control--invalid'}`}>
            <label htmlFor={props.id}>{props.label}</label>
            {element}
            { !inputState.isValid && inputState.isTouch && <p style={{marginTop:'2%'}}><i class="fas fa-exclamation-triangle" style={{color:'red'}}></i> {props.errorText}</p> }
        </div>
    )
}

export default Input;