import React from 'react'
import { Link } from "react-router-dom"
import { useDispatch } from 'react-redux'
import { gql, useMutation } from '@apollo/client'
import Notification from './notification'
import emailjs from 'emailjs-com'



const ADD_RESERVATION = gql`
mutation addReservation($reservedAt: String!, $time: String!, $customers: Int!, $user: ID) {
  addReservation(
    reservedAt: $reservedAt
    time: $time
    customers: $customers
    user: $user
  ) {
    reservedAt
    time
    customers
  }
}
`



const Reservation = (props) => {
  const dispatch = useDispatch()
  const [ addReservation ] = useMutation(ADD_RESERVATION)


  const handleSubmit = async (event) => {
    event.preventDefault()

    const reservedAt = event.target.date.value
    const time = event.target.time.value
    const customers = parseInt(event.target.customers.value)
    const user = props.userID

    if (props.userID !== null) {

      try {
        await addReservation({ variables: { reservedAt, time, customers, user } })
      } catch (error) {
        props.setError(error.message)
      }
     
      emailjs
        .sendForm('service_d7tzr1g', 'template_od0ql1o', event.target, 'user_uLpm5LanNOvUTRchkjsAS')
        .then((result) => {
            props.setSuccess("Book successfully!")
        }, (error) => {
            props.setError(error.text);
        })
    } else {
      dispatch({
        type: 'BOOK_TIME',
        data: {
          reservedAt,
          time,
          customers
        }
      })
  
      props.setReserve(true)
    }

    event.target.date.value = ''
    event.target.time.value = ''
    event.target.customers.value = null
  }


  return (
    <div className='reservation'>
      {/* Image Background */}
      <div className="bg2">
        <div className="reservation-bigger-form">
          <div id="reserve-bg">
            <Notification errorMessage={props.errorMessage} successMessage={props.successMessage} />
            <form className='reservation-form' onSubmit={handleSubmit}>
              <input type="hidden" name='email' value={props.email ?props.email :''} />
              <input type="date" name='date' required />
              <select name='time' required>
                <option value="9:00 a.m.">9:00 a.m.</option>
                <option value="10:30 a.m.">10:30 a.m.</option>
                <option value="12:00 p.m.">12:00 p.m.</option>
                <option value="1:30 p.m.">1:30 p.m.</option>
                <option value="3:00 p.m.">3:00 p.m.</option>
                <option value="4:30 p.m.">4:30 p.m.</option>
                <option value="6:00 p.m.">6:00 p.m.</option>
              </select>
              <input type="number" min="1" max="6" placeholder="customer(s)" name='customers' required />
              <input className='btn btn-danger py-3 px-5' type="submit" value="Reserve Now" />
            </form>
          </div>

          {/* Link */}
          <div className='reservation-link'>
            <Link className='btn btn-info py-3 px-5' to="/">Go back Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}



export default Reservation