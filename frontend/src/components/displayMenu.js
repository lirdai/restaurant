import React, { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import foodPic from '../decorator/pictures/food.jpg'
import coffeePic from '../decorator/pictures/coffee.jpg'
import dessertPic from '../decorator/pictures/dessert.jpg'



const Example = ({ show, handleClose, quantity, setQuantity, food, handleSubmit }) => {
    const handlePlusQuantity = () => {
        setQuantity(quantity + 1)
    }

    const handleMinusQuantity = () => {
        if (quantity > 1 ) {
            setQuantity(quantity - 1)
        } else {
            setQuantity(1)
        }
    }

    return (
        <div>
            <Modal show={show} onHide={handleClose}>
                <form onSubmit={handleSubmit}>

                <Modal.Header closeButton>
                    <Modal.Title>{food.name}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <b id='quantity'>Quantity: 
                    <input type='hidden' name='item' value={ food.id } />
                    <input type='hidden' name='name' value={ food.name } />
                    <input type='hidden' name='price' value={ (quantity * food.price).toFixed(2) } />
                    <button type='button' onClick={handleMinusQuantity} className='pr-4'><i className="fas fa-minus fa-lg" ></i></button>
                    <input value={quantity} name='quantity' className='text-center' onChange={(quantity) => quantity} /> 
                    <button type='button' onClick={handlePlusQuantity} className='pr-4'><i className="fas fa-plus fa-lg"></i> </button>
                    <p>Price: $ { (quantity * food.price).toFixed(2) }</p>
                    </b>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" type='submit' onClick={handleClose}>Close</Button>
                    <input type="submit" value="Save Changes" />
                </Modal.Footer>
                </form>
            </Modal>
        </div>
    )
}



const DisplayPartFood = ({menu, category, picture}) => {
    const dispatch = useDispatch()

    const handleSubmit = (event) => {
        event.preventDefault()
        
        dispatch({
            type: 'ORDER_FOOD',
            data: {
                item: event.target.item.value,
                name: event.target.name.value,
                quantity: parseInt(event.target.quantity.value),
                price: parseFloat(event.target.price.value).toFixed(2)  
            }
        })
    }    

    const [ quantity, setQuantity ] = useState(1)
    const [show, setShow] = useState(menu.reduce((result, food) => {
        result[food.id] = false
        return result
    }, {}))

    const handleClose = (food_id) => {
        return () => {
            setQuantity(1)
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

    return (
        <div id='menu-grid'>
            {menu.filter(food => food.category === category).map(food => 
                <div key={food.id}>
                    <div className="card mb-3" id="card-height">
                        <div className="row no-gutters">
                            <div className="col-md-4">
                                {/* 
                                    Coffee
                                    Fahmi Fakhrudin
                                    @fahmipaping 
                                    https://unsplash.com/photos/nzyzAUsbV0M

                                    Food
                                    amirali mirhashemian
                                    @amir_v_ali
                                    https://unsplash.com/photos/Ea_IbQfxm-0

                                    Cake
                                    Toa Heftiba
                                    @heftiba
                                    https://unsplash.com/photos/2eylVMKAr1A
                                */}
                                <img src={picture} width="100" height="200" className="card-img" alt={food.category} onClick={handleShow(food.id)} />
                            </div>
        
                            <div className="col-md-8">
                                <div className="card-body">
                                    <h5 className="card-title" onClick={handleShow(food.id)}>{food.name}</h5>

                                    <Example 
                                        show={show[food.id]} 
                                        handleClose={handleClose(food.id)} 
                                        quantity={quantity} 
                                        setQuantity={setQuantity} 
                                        food={food}
                                        handleSubmit={handleSubmit}
                                    />

                                    <p className="card-text" onClick={handleShow(food.id)}>{food.description}</p>
                                    <p className="card-text"><small className="text-muted">$ {food.price}</small></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}



const DisplayMenu = ({menu, userID}) => {
    let category_array = ['coffee', 'food', 'dessert']
    let picture_array = [coffeePic, foodPic, dessertPic]
    
    return(
        <div>
            {category_array.map((category, index) => 
                <div key={index}>
                    <h3 id={category} className='mt-5'>{category.toUpperCase()}</h3>
                    <DisplayPartFood 
                        menu={menu}
                        userID={userID} 
                        category={category} 
                        picture={picture_array[index]} 
                    />
                </div>
            )}
        </div>
    )
}



export default DisplayMenu