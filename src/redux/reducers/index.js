// Set up your root reducer here...
import { combineReducers } from 'redux';
// import {routerReducer} from 'react-router-redux';
import UserReducer from './userReducer/userReducer'
import paymentModalReducer from './paymentModalReducer';
const rootReducer = combineReducers (
    {
        userData:UserReducer,
        paymentData:paymentModalReducer
      
    }
)
export default rootReducer;