const deliverIDReducer = (state = '', action) => {
    switch(action.type) {
        case 'DELIVER_ID':
            return action.data
        default: 
            return state
    }
}



export default deliverIDReducer