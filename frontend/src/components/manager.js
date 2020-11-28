import React from 'react'
import { useApolloClient } from '@apollo/client'
import { Link } from "react-router-dom"



const Manager = (props) => {
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
        <div className='manager-nav-bigger'>
        <div className='manager-nav'>
            <Link className='btn btn-primary' to="/logout" onClick={logout}>Log Out</Link>
            {/* Control Menu */}
            <Link className='btn btn-primary' to="/manager/menu"> Menu </Link>
            {/* Check Reservation */}
            <Link className='btn btn-primary' to="/manager/reservation"> Reservation </Link>
            {/* Check Deliver */}
            <Link className='btn btn-primary' to="/manager/deliver"> Deliver </Link>
        </div>
        </div>
    )
}



export default Manager