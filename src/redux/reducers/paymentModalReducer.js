import constants from '../constants'
let initialState = {
    show:false
}
export default (state =initialState,action)=>{
    switch(action.type) {
       
        case constants.SET_MODAL_VALUE:
                // console.log('Add Game reducer',action.payload);
                state = action.payload;
            return state;
        default:
            return state;
     
    }
    
}