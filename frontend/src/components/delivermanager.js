import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import { gql, useQuery, useSubscription } from '@apollo/client'



const ALL_DELIVERS = gql`
query {
    allDelivers {
      purchase_date
      price
      ordered
      accepted
      delivered
      id
      user {
        username
      }
      courtier {
        username
      }
      info {
        email
        phone
        street
        street2
        city
        postal_code
      }
    }
}
`
const ORDERED = gql`
  subscription {
    ordered {
      purchase_date
      price
      ordered
      accepted
      delivered
      id
      user {
        username
      }
      courtier {
        username
      }
      info {
        email
        phone
        street
        street2
        city
        postal_code
      }
    }
  }
`
const ACCEPTED = gql`  
  subscription {
    accepted {
      purchase_date
      price
      ordered
      accepted
      delivered
      id
      user {
        username
      }
      courtier {
        username
      }
      info {
        email
        phone
        street
        street2
        city
        postal_code
      }
    }
  }
`
const DELIVERED = gql`  
  subscription {
    delivered {
      purchase_date
      price
      ordered
      accepted
      delivered
      id
      user {
        username
      }
      courtier {
        username
      }
      info {
        email
        phone
        street
        street2
        city
        postal_code
      }
    }
  }
`



const DeliverManager = () => {
  const [ orders, setOrders ] = useState([])

  const style_false = {
    color: 'red'
  }

  const style_true = {
    color: 'green'
  }

  const delivers = useQuery(ALL_DELIVERS)

  useSubscription(ORDERED, {
    onSubscriptionData: ({ subscriptionData }) => {
      setOrders(orders.concat(subscriptionData.data.ordered))
    }
  })

  useSubscription(ACCEPTED, {
    onSubscriptionData: ({ subscriptionData }) => {
      setOrders(orders.map(order => order.id === subscriptionData.data.accepted.id ? subscriptionData.data.accepted : order))
    }
  })

  useSubscription(DELIVERED, {
    onSubscriptionData: ({ subscriptionData }) => {
      setOrders(orders.map(order => order.id === subscriptionData.data.delivered.id ? subscriptionData.data.delivered : order))
    }
  })

  useEffect(() => {
    if (delivers.data) {
      setOrders(delivers.data.allDelivers)
    }
  }, [delivers.data])


  return (
    <div>
      <Link to='/manager'>Main Page</Link>
      {/* Display delivers */}
      <div>
        {delivers.loading
          ? <div>loading...</div>
          : <table className="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Purchase Date</th>
                <th scope="col">Price</th>
                <th scope="col">User</th>
                <th scope="col">Phone</th>
                <th scope="col">Street</th>
                <th scope="col">Apt#</th>
                <th scope="col">City</th>
                <th scope="col">Postal Code</th>
                <th scope="col">Accepted</th>
                <th scope="col">Delivered</th>
              </tr>
            </thead>
            <tbody>
              {orders.filter(deliver => deliver.ordered === true).map(deliver => 
                <tr key={deliver.id}>
                    <th scope="row">{deliver.id}</th>
                    <td>{new Date(parseInt(deliver.purchase_date)).toLocaleString()}</td>
                    <td>{deliver.price}</td>
                    <td>{deliver.user ? deliver.user.username : "None"}</td>
                    <td>{deliver.info ? deliver.info.phone : "None"}</td>
                    <td>{deliver.info ? deliver.info.street : "None"}</td>
                    <td>{deliver.info ? deliver.info.street2 : "None"}</td>
                    <td>{deliver.info ? deliver.info.city : "None"}</td>
                    <td>{deliver.info ? deliver.info.postal_code : "None"}</td>
                    <td>
                      <button style={deliver.accepted ? style_true : style_false} className='btn btn-white'>
                        <i className="fas fa-check"></i>
                      </button>
                    </td>
                    <td>
                      <button style={deliver.delivered ? style_true : style_false} className='btn btn-white'>
                        <i className="fas fa-check"></i>
                      </button>
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



export default DeliverManager