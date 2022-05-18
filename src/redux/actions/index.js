
import {AsyncStorage} from 'react-native'
import constants from '../constants'


export  const  setUser= (data)=>{
    
        return(dispatch)=>{
            dispatch({
                       type:constants.SET_USER,
                        payload:data
                   });
                }
    }


    export  const  setPaymentModal= (value)=>{
    
        return(dispatch)=>{
            dispatch({
                       type:constants.SET_MODAL_VALUE,
                        payload:{show:value}
                   });
                }
    }

