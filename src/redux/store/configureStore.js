import {createStore,applyMiddleware,combineReducers} from 'redux'
import thunk from 'redux-thunk'

import userReducer from '../reducers/userReducer'
import PaymentModal from '../reducers/paymentModalReducer'

export default function configureStore() {
    const reducers = combineReducers({
          
       userData:userReducer,
       modalData:PaymentModal
    })
    let store = createStore(reducers,
       
        applyMiddleware(thunk)
    )
    return store;
    
     
    }
