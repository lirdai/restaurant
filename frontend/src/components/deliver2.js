import React from 'react'
import { gql, useMutation } from '@apollo/client'
import { useSelector } from 'react-redux'
import { Link } from "react-router-dom"



const UPDATE_DELIVER = gql`
mutation updateDeliver($id: ID!, $orderlists: [ID]!, $price: Float!, $email: String, $phone: String, $street: String, $street2: String, $city: String, $postal_code: String) {
    updateDeliver(
        id: $id
        orderlists: $orderlists
        price: $price
        email: $email
        phone: $phone
        street: $street
        street2: $street2
        city: $city
        postal_code: $postal_code
    ) {
        id
    }
}
`



const DeliverSecond = (props) => {
    const orders = useSelector(state => state.orders)
    const deliverid = useSelector(state => state.deliverid)
    const [ updateDeliver ] = useMutation(UPDATE_DELIVER)

    const handleSubmit = (event) => {
        event.preventDefault()

        const id = deliverid
        const orderlists = orders.map(order => order.item)
        const price = orders.reduce((total, order) => {
            return total + parseFloat(order.price)
          }, 0)
        const email = event.target.email.value
        const phone = event.target.phone.value
        const street = event.target.street.value
        const street2 = event.target.street2.value
        const city = event.target.city.value
        const postal_code = event.target.postal_code.value

        updateDeliver({ variables: { id, orderlists, price, email, phone, street, street2, city, postal_code } })

        event.target.email.value = ''
        event.target.phone.value = ''
        event.target.street.value = ''
        event.target.street2.value = ''
        event.target.city.value = ''
        event.target.postal_code.value = ''

        props.setDeliver(false)
    }


    return (
        <div className='reservation2-bigger'>
            <form className='reservation2-grid' onSubmit={handleSubmit}>
                <input type='text' name='email' placeholder='E-mail' />
                <input type='text' name='phone' placeholder='Phone' />
                <input type='text' name='street' placeholder='Street' />
                <input type='text' name='street2' placeholder='Street2' />
                <input type='text' name='city' placeholder='City' />
                <input type='text' name='postal_code' placeholder='Postal Code' />

                <input type='submit' value='Deliver Now' />
            </form>
             {/* Users */}
            <small className='mt-3'>want to <Link to="/login">login</Link> ?</small>
            <small>Register as a <Link to="/register">user</Link>?</small>
        </div>
    )
}



export default DeliverSecond