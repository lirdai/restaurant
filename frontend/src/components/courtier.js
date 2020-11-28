import React from 'react'
import { useApolloClient } from '@apollo/client';
import { Link } from "react-router-dom"



const Courtier = (props) => {
    const client = useApolloClient()

    const logout = () => {
        props.setToken(null)
        props.setRole(null)
        props.setUserID(null)
        props.setUsername(null)
        localStorage.clear()
        client.resetStore()
    }

    return (
        <div>
            <div>
              <Link to="/logout" onClick={logout}>Log Out</Link>
            </div>

            Hello, Courtier!

            
        </div>
    )
}



export default Courtier