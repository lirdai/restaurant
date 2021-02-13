import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import { gql, useLazyQuery, useQuery, useMutation, useSubscription } from '@apollo/client'
import { useApolloClient } from '@apollo/client'
import { Button, Modal } from 'react-bootstrap'
import Pagination from './pagination'



const FIND_SAME_KIN_FOOD = gql`
  query findSameKindFood($categoryToSearch: String!) {
    findSameKindFood(category: $categoryToSearch) {
      name
      description
      price
      id
    }
  }
`

const FIND_ALL_REVIEWS = gql`
  query {
    findAllReviews{
      id
      title
      comment
      date
      user {
        username
      }
    }
  }
`

const ADD_REVIEW = gql`
mutation addReview($user: ID!, $title: String!, $comment: String!) {
  addReview(
    user: $user,
    title: $title,
    comment: $comment
  ) {
    title
    comment
  }
}
`

const REVIEW_ADDED = gql`
  subscription {
    reviewAdded {
      user {
        username
      }
      title
      comment
      date
      id
    }
  }
`



function Example(props) {
  const handleSubmit = (event) => {
    event.preventDefault()

    const user = props.userID
    const title = event.target.title.value
    const comment = event.target.comment.value

    props.addReview({ variables: { user, title, comment } })
  }

  return (
    <div>
      <Modal show={props.show} onHide={props.handleClose}>
        <form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Comment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input type='text' name='title' placeholder='Title' />
            <br /><br />
            <textarea rows='5' cols='60' name='comment' placeholder='Any Comment Here...'></textarea>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={props.handleClose} type='button'>
              Close
            </Button>
            <Button variant="primary" onClick={props.handleClose} type='submit'>
              Save Comment
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}



const Home = (props) => {
  // UseState
  const [ show, setShow ] = useState(false)
  const [ menu, setMenu ] = useState(null)
  const [ reviews, setReviews ] = useState([])
  const [ currentPage, setCurrentPage ] = useState(1)
  const [ postsPerPage ] = useState(2)

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = reviews.slice(indexOfFirstPost, indexOfLastPost)
  const Paginate = (pageNumber) => setCurrentPage(pageNumber)

  // GraphQL
  const reviews_result = useQuery(FIND_ALL_REVIEWS)
  const [ getMenu, result ] = useLazyQuery(FIND_SAME_KIN_FOOD)
  const [ addReview ] = useMutation(ADD_REVIEW)

  useSubscription(REVIEW_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (reviews_result.loading === false) {
        setReviews(reviews.concat(subscriptionData.data.reviewAdded))
      }
    }
  })

  const client = useApolloClient()
  
  // Helper Function
  const handleFoodCategory = (category_input) => {
    getMenu({ variables: { categoryToSearch: category_input }})
  }

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const logout = () => {
    props.setToken(null)
    props.setRole(null)
    props.setUserID(null)
    props.setUsername(null)
    localStorage.clear()
    client.resetStore()
  }

  // useEffect
  useEffect(() => {
    if (result.data) {
      // console.log(result.data)
      setMenu(result.data.findSameKindFood)
    }
  }, [result])

  useEffect(() => {
    if (reviews_result.loading === false && reviews_result.data) {
      // console.log(reviews_result)
      setReviews(reviews_result.data.findAllReviews)
    } 
  }, [reviews_result.data, reviews_result.loading])


  return (
    <div>
      {/* Front Page */}
      {/* Image Background */}
      <div className="bg1">
        {/* Caption */}
        <div id='caption'>Cappuccino</div>
        {props.username
          ? <div id='caption-logout'>
              Hello, {props.username}!
              <Link to="/logout" onClick={logout}>Log Out</Link>
            </div>
          : <Link id='caption-login' to="/login">Log In</Link>
        }
        
       
        {/* Link */}
        <div id="home-grid-container">
          <Link id='reservation' className="btn btn-danger" to="/reservation">Reservation</Link>
          <Link id='deliver' className="btn btn-danger" to="/deliver">Delivery</Link>
        </div>
      </div>


      {/* Menu */}
      <div className='menu-bar'>
        <p id='menu-caption'>Our Menu</p>
        <div className='menu mb-5'>
          <button className='btn btn-info' onClick={() => handleFoodCategory('coffee')}>Coffee</button>
          <button className='btn btn-info' onClick={() => handleFoodCategory('food')}>Main Food</button>
          <button className='btn btn-info' onClick={() => handleFoodCategory('dessert')}>Dessert</button>
        </div>
        { menu === null 
          ? <p className='mt-5 text-center text-dark font-weight-bolder'>Welcome to Cappuccino! Please press button to see Menu</p>
          : <table className="table table-striped table-light mt-5">
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {menu.map(
                  food => <tr key={food.id}>
                    <th scope="row">
                      {food.name}
                      <br /><br />
                      <small>{food.description}</small>
                    </th>
                    <td>${food.price}</td>
                  </tr>
                )}
              </tbody>
            </table>
          }
      </div>
      

      {/* Comments on Restaurant */}
      <div className='review'>
        <h3>Reviews</h3> 
        {props.token !== null
          ? <button onClick={handleShow}><i className="fas fa-edit fa-2x"></i></button>
          : <p>Please Log in to write a review !</p>
        }
        
        <div id='reviews'>
          {reviews_result.loading
            ? <p>Loading...</p>
            : <div className='mt-5'>
                {currentPosts.map(
                  review => 
                  <div key={review.id}>
                    <h5>{review.title}</h5> 
                    <p>Created by {review.user.username}</p>
                    <p className='pl-3'>{review.comment}</p>
                    <p id='line'>{new Date(parseInt(review.date)).toLocaleString()}</p>
                  </div>
                )}
            </div>
          }
        </div>

        <Example 
          show = {show} 
          handleClose = {handleClose} 
          addReview = {addReview}
          userID = {props.userID}
        />

        <Pagination 
          postsPerPage = {postsPerPage}
          totalPosts = {reviews.length}
          Paginate = {Paginate}
        />
      </div>
    </div>
  )
}



export default Home