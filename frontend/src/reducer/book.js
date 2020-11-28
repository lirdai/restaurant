const bookReducer = (state = [], action) => {
    switch(action.type) {
        case 'BOOK_TIME':
            return action.data
        default: 
            return state
    }
}



export default bookReducer