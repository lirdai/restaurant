import React from 'react'



const Notification = ({ errorMessage, successMessage }) => {
    return (
        <div>
            {errorMessage
                ? <div className="alert alert-danger" role="alert">
                    {errorMessage}
                </div>
                : null
            }

            {successMessage
                ? <div className="alert alert-success" role="success">
                    {successMessage}
                </div>
                : null
            }
        </div>
    )
}



export default Notification