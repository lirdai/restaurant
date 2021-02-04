import React from 'react'
import { gql, useQuery } from '@apollo/client'
import DisplayMenu from './displayMenu'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'



const All_FOOD = gql`
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



const Deliver = (props) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const menu = useQuery(All_FOOD)
  const orders = useSelector(state => state.orders)
  const price = orders.reduce((total, order) => {
    return total + parseFloat(order.price)
  }, 0)


  const handleClick = () => {
    if (props.userID === null) {
      history.push('/deliver/signup')
    } else {
      history.push('/checkout')
    }
  }


  const handleDeleteClick = (itemID) => {
    dispatch({
      type: "DELETE_FOOD",
      data: {
        item: itemID
      }
    })
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
                  <td>
                    <button onClick={() => handleDeleteClick(order.item)} className='btn btn-light'>
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
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