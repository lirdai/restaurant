import React, { useState, useEffect } from 'react'
import { useApolloClient } from '@apollo/client'
import { Link } from "react-router-dom"
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client'



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
const UPDATE_DELIVER_ACCEPTED = gql`
mutation updateDeliverAccepted($id: ID!, $courtier: ID!, $accepted: Boolean!) {
    updateDeliverAccepted(
        id: $id,
        courtier: $courtier,
        accepted: $accepted
    ) {
        id
    }
}
`
const UPDATE_DELIVER_DELIVERED = gql`
mutation updateDeliverDelivered($id: ID!, $delivered: Boolean!) {
    updateDeliverDelivered(
        id: $id,
        delivered: $delivered
    ) {
        id
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



const Courtier = (props) => {
    const [ orders, setOrders ] = useState([])

    const style_false = {
        color: 'red'
    }

    const style_true = {
        color: 'green'
    }

    const client = useApolloClient()
    const delivers = useQuery(ALL_DELIVERS)
    const [ updateDeliverAccepted ] = useMutation(UPDATE_DELIVER_ACCEPTED)
    const [ updateDeliverDelivered ] = useMutation(UPDATE_DELIVER_DELIVERED)

    useSubscription(ORDERED, {
        onSubscriptionData: ({ subscriptionData }) => {
            setOrders(orders.concat(subscriptionData.data.ordered))
        }
    })

    useEffect(() => {
        if (delivers.data) {
            setOrders(delivers.data.allDelivers)
        }
    }, [delivers.data])

    const logout = () => {
        props.setToken(null)
        props.setRole(null)
        props.setUserID(null)
        props.setUsername(null)
        localStorage.clear()
        client.resetStore()
    }

    const handleAccepted = (event) => {
        const id = event.target.id.value
        const accepted = true
        const courtier = localStorage.getItem('userID')

        updateDeliverAccepted({ variables: { id, accepted, courtier } })
    }

    const handleDelivered = (event) => {
        const id = event.target.id.value
        const delivered = true

        updateDeliverDelivered({ variables: { id, delivered } })
    }

    return (
        <div>
            <div>
              <Link to="/logout" onClick={logout}>Log Out</Link>
            </div>

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
                                        <form onSubmit={handleAccepted}>
                                            <input type='hidden' name='id' value={deliver.id} />
                                            <button style={deliver.accepted ? style_true : style_false} className='btn btn-white'>
                                                <i className="fas fa-check"></i>
                                            </button>
                                        </form>
                                    </td>
                                    <td>
                                        <form onSubmit={handleDelivered}>
                                            <input type='hidden' name='id' value={deliver.id} />
                                            <button style={deliver.delivered ? style_true : style_false} className='btn btn-white'>
                                                <i className="fas fa-check"></i>
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



export default Courtier