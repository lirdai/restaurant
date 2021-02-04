import React, { useEffect, useState } from 'react'
import { gql, useSubscription } from '@apollo/client'
import { useSelector } from 'react-redux'
import Notification from './notification'



const ACCEPTED = gql`  
  subscription {
    accepted {
      id
    }
  }
`
const DELIVERED = gql`  
  subscription {
    delivered {
      id
    }
  }
`



const Delivering = (props) => {
    const deliverid = useSelector(state => state.deliverid)
    const orders = useSelector(state => state.orders)
    const price = orders.reduce((total, order) => {
      return total + parseFloat(order.price)
    }, 0)

    const [ deliverID, setDeliverID ] = useState(deliverid ? deliverid.id : null)
    const [ accepted, setAccepted ] = useState(false)
    const [ delivered, setDelivered ] = useState(false)


    useSubscription(ACCEPTED, {
        onSubscriptionData: ({ subscriptionData }) => {
            setDeliverID(subscriptionData.data.accepted.id)
            setAccepted(true)
        }
    })
    
    useSubscription(DELIVERED, {
        onSubscriptionData: ({ subscriptionData }) => {
            setDeliverID(subscriptionData.data.delivered.id)
            setDelivered(true)
        }
    })


    useEffect(() => {
      if (!accepted && !delivered) {
        props.setSuccess(`Your order # ${deliverID} has been ordered successfully. Please wait for courtier to pick up!`)
      } 
      if (accepted && !delivered) {
        props.setSuccess(`Your order # ${deliverID} has been picked up. Your courtier is on the way...`)
      }
    }, [])
    
  
    return (
        <div>
          <Notification 
            errorMessage={props.errorMessage}
            successMessage={props.successMessage}
          />

          <div className="order-list">
            <h2>Order List</h2>
            <table className="table table-delivering">
              <tbody>
                {
                  orders.map((order, index) => 
                  <tr key={index}>
                    <td>{order.name}</td>
                    <td>{order.quantity}</td>
                    <td>$ {order.price}</td>
                  </tr>)
                }          
              </tbody>
            </table>
            <h5>Total Price: ${price.toFixed(2)}</h5>
          </div>
        </div>
    )
}



export default Delivering