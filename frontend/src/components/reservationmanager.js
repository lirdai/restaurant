import React from 'react'
import { Link } from "react-router-dom"
import { gql, useQuery, useMutation } from '@apollo/client'



const ALL_RESERVATIONS = gql`
query {
  allReservations {
    reservedAt
    time
    customers
    email
    phone
    check
    id
    user {
      username
    }
  }
}
`

const UPDATE_RESERVATION_CHECK = gql`
mutation updateReservationCheck($id: ID!, $check: Boolean!) {
  updateReservationCheck(
    id: $id
    check: $check
  ) {
    id
  }
}
`



const ReservationManager = () => {
  const reservation = useQuery(ALL_RESERVATIONS)
  const [ updateReservationCheck ] = useMutation(UPDATE_RESERVATION_CHECK)

  const style_false = {
    color: 'red'
  }

  const style_true = {
    color: 'green'
  }

  const changeCheck = (event) => {
    const id = event.target.id.value
    const check = true
    updateReservationCheck({  variables: { id, check } })
  }

  // const handleSubmit = (event) => {
  //   event.preventDefault()

  //   const min_date = event.target.min_date.value
  //   const max_date = event.target.max_date.value

  //   localStorage.setItem('min_date', min_date)
  //   localStorage.setItem('max_date', max_date)

  //   event.target.min_date.value=''
  //   event.target.max_date.value=''
  // }

  return (
    <div>
      <h6 className='text-center my-5'>
        <Link to='/manager'>Main Page</Link>
      </h6>

      {/* Change Min Date */}
      {/* <div className='reservation-manager-bigger'>
        <form onSubmit={handleSubmit} className='reservation-manager-form'>
          <div>
            <h6 className='mb-3'>Change Min Date: </h6>
            <input type='text' placeholder='Format: 2020-11-20' name='min_date' />
          </div>

          <div>
            <h6 className='mb-3'>Change Max Date: </h6>
            <input type='text' placeholder='Format: 2020-11-20' name='max_date' />
          </div>
        
          <button type='submit'>Save Changes</button>
        </form>
      </div> */}

      {/* Display Reservation */}
      <div className='reservation-manager-display'>
      {reservation.loading
        ? <div>loading...</div>
        : <table className="table">
            <thead>
              <tr>
                <th scope="col">Reservation Date</th>
                <th scope="col">Reservation Time</th>
                <th scope="col">Number of Customers</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Username</th>
                <th scope="col">Accepted</th>
              </tr>
            </thead>
            <tbody>
            {reservation.data.allReservations.map(res => 
                <tr key={res.id}>
                  <th scope="row">{res.reservedAt}</th>
                  <td>{res.time}</td>
                  <td>{res.customers}</td>
                  <td>{res.email ? res.email : 'None'}</td>
                  <td>{res.phone ? res.phone : 'None'}</td>
                  <td>{res.user ? res.user.username : "None"}</td>
                  <td>
                    <form onSubmit={changeCheck}>
                      <input type='hidden' value={res.id} name='id' />
                      <button className='btn btn-white' type='submit'>
                        <i style={res.check ? style_true : style_false} className="fas fa-check"></i>
                      </button>
                    </form>
                  </td>
                </tr> 
              )}
            </tbody>
          </table>
      }
      </div>
    </div>
  )
}



export default ReservationManager