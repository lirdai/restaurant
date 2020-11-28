import React from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import DisplayMenu from './displayMenu'
import { useSelector } from 'react-redux'



const All_Food = gql`
query {
  allFood  {
    name
    description
    category
    price
    id
  }
}
`

const UPDATE_DELIVER = gql`
mutation updateDeliver($id: ID!, $orderlists: [ID]!, $price: Float!) {
    updateDeliver(
        id: $id
        orderlists: $orderlists
        price: $price
    ) {
        id
    }
}
`



const Deliver = (props) => {
  const menu = useQuery(All_Food)
  const [ updateDeliver ] = useMutation(UPDATE_DELIVER)
  const orders = useSelector(state => state.orders)
  const id = useSelector(state => state.deliverid)
  const orderlists = orders.map(order => order.item)
  const price = orders.reduce((total, order) => {
    return total + parseFloat(order.price)
  }, 0)

  const handleClick = () => {
    if (props.userID === null) {
      props.setDeliver(true)
    } else {
      updateDeliver({ variables: { id, orderlists, price } })
      props.setCheckout(true)
    }
  }

  return (
    <div className='deliver p-5'>
      {/* Image Background */}
      <div className='deliver-page'>
        <div>
          <div className="bg3"></div>
          <div className='deliver-bar'>
            <a href="#coffee">Coffee</a>
            <a href="#food">Main Food</a>
            <a href="#dessert">Dessert</a>
          </div>

          {menu.loading
            ? <p>Loading...</p>
            : <DisplayMenu 
                menu={menu.data.allFood} 
                userID={props.userID} 
              />
          }
        </div>
        <div className='cart'>
          <h5>Shopping Cart</h5>
          <table className="table">
            <tbody>
              {
                orders.map((order, index) => 
                <tr key={index}>
                  <td>{order.name}</td>
                  <td>{order.quantity}</td>
                  <td>$ {order.price}</td>
                </tr>
                )
              }          
            </tbody>
          </table>
          <h5>Total Price: ${price.toFixed(2)}</h5>
          <button onClick={handleClick}>Check Out</button>
        </div>
      </div>
    </div>
  )
}



export default Deliver