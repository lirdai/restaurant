import React, { useState, useEffect } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Modal, Button } from 'react-bootstrap'
import { Link } from "react-router-dom"



const ALL_FOOD = gql`
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

const ADD_FOOD = gql`
mutation addFood($name: String!, $description: String!, $category: String!, $price: Float!) {
  addFood(
    name: $name
    description: $description
    category: $category
    price: $price
  ) {
    id
  }
}
`

const UPDATE_FOOD_PRICE = gql`
mutation updateFoodPrice($id: ID!, $price: Float!) {
  updateFoodPrice(
    id: $id
    price: $price
  ) {
    id
  }
}
`

const DELETE_FOOD = gql`
mutation deleteFood($id: ID!) {
  deleteFood(
    id: $id
  ) {
    id
  }
}
`



const Example = ({ show, handleClose, updateFoodPrice, id }) => {
  const handleSubmit = (event) => {
    const price = parseFloat(event.target.price.value)
    updateFoodPrice({ variables: {id, price} })
    event.target.price.value = ''
  }

  return (
    <div>
      <Modal show={show} onHide={handleClose}>
        <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Update Price</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input text='type' name='price' placeholder='Change Price' />
        </Modal.Body>
        <Modal.Footer>
          <Button type='button' variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button type='submit' variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}



const MenuManager = () => {
  const [show, setShow] = useState({})
  const [ menu, setMenu ] = useState([])

  const result = useQuery(ALL_FOOD)
  const [ addFood ] = useMutation(ADD_FOOD)
  const [ updateFoodPrice ] = useMutation(UPDATE_FOOD_PRICE)
  const [ deleteFood ] = useMutation(DELETE_FOOD)

  useEffect(()=> {
    if (result.data) {
      setMenu(result.data.allFood)
    }
  }, [result.data])
  
  useEffect(() => {
    setShow(menu.reduce((result, food) => {
      result[food.id] = false
      return result
    }, {}))
  }, [menu])

  const handleClose = (food_id) => {
    return () => {
        var s = {
            ...show,
        }
        s[food_id] = false
        setShow(s)
    }
  }

  const handleShow = (food_id) => {
    return () => {
        var s = {
            ...show,
        }
        s[food_id] = true
        setShow(s)
    }
  }

  const handleAddFood = (event) => {
    const name = event.target.name.value
    const description = event.target.description.value
    const category = event.target.category.value
    const price = parseFloat(event.target.price.value)

    addFood({ variables: { name, description, category, price } })

    event.target.name.value = ''
    event.target.description.value = ''
    event.target.category.value = ''
    event.target.price.value = ''
  }

  const handleDeleteFood = (event) => {
    const id = event.target.id.value
    deleteFood({ variables: { id } })
  }

  return (
    <div>
      {result.loading
        ? <div>Loading...</div>
        : <div>
            <h2 className='text-center my-5'>Menu</h2>
            <h6 className='text-center my-5'>
              <Link to="/manager"> Main Page </Link>
            </h6>
            
            <table className="table table-dark">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Category</th>
                  <th scope="col">Price</th>
                  <th scope="col"></th>
                </tr>
              </thead>

              <tbody>
                {menu.map(food => 
                  <tr key={food.id}>
                    <th scope="row">{food.name}</th>
                    <td>{food.description}</td>
                    <td>{food.category}</td>
                    <td>
                      <p>${food.price}</p>
                      <button className='btn btn-dark' onClick={handleShow(food.id)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <Example 
                        show={show[food.id]} 
                        handleClose={handleClose(food.id)} 
                        updateFoodPrice={updateFoodPrice}
                        id={food.id}
                      />
                    </td>
                    <td>
                      <form onSubmit={handleDeleteFood}>
                        <input type='hidden' name='id' value={food.id} />
                        <button type='submit' className='btn btn-dark'>
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </form>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      }


      <div className='menu-manager-bigger'>
        <form onSubmit={handleAddFood} className='menu-manager'>
          <input type='text' name='name' placeholder='Food Name' />
          <textarea type='text' name='description' placeholder='Food Description'></textarea>

          <div className='menu-manager-radio'>
            <div className='menu-radio'>
              <input type='radio' name='category' value='coffee' />
              <label>Coffee</label>
            </div>

            <div className='menu-radio'>
              <input type='radio' name='category' value='food' />
              <label>Food</label>
            </div>

            <div className='menu-radio'>
              <input type='radio' name='category' value='dessert' />
              <label>Dessert</label>
            </div>
          </div>

          <input type='text' name='price' placeholder='Food Price' />

          <button className='btn btn-primary' type='submit'>CREATE NEW FOOD</button>
        </form>
      </div>
    </div>
  )
}



export default MenuManager