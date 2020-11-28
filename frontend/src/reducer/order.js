const orderReducer = (state = [], action) => {
    switch(action.type) {
        case 'ORDER_FOOD':
            return state.concat(action.data)
        default: 
            return state
    }
}



export default orderReducer