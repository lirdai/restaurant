const orderReducer = (state = [], action) => {
    switch(action.type) {
        case 'ORDER_FOOD':
            return state.concat(action.data)
        case 'DELETE_FOOD':
            const itemsNotDelete= state.filter(food => food.item !== action.data.item)
            return itemsNotDelete
        default: 
            return state
    }
}



export default orderReducer