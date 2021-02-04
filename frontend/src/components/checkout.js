import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from "react-router-dom"
import { gql, useMutation } from '@apollo/client'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'



const CREATE_DELIVER = gql`
mutation createDeliver($orderlist: [OrderEntry]!, $price: Float!, $ordered: Boolean!, $user: ID, $email: String, $phone: String, $street: String, $street2: String, $city: String, $postal_code: String) {
    createDeliver(
        orderlist: $orderlist
        price: $price
        ordered: $ordered
        user: $user
        email: $email
        phone: $phone
        street: $street
        street2: $street2
        city: $city
        postal_code: $postal_code
    ) {
        id
    }
}`

const STRIPE_CHARGE = gql`
mutation stripeCharge($amount: Float!) {
    stripeCharge(
        amount: $amount
    ) {
        clientSecret
    }
}`



const Checkout = (props) => {
    const dispatch = useDispatch()
    const [ createDeliver, result_deliver ] = useMutation(CREATE_DELIVER)
    const [ stripeCharge, result_stripe ] = useMutation(STRIPE_CHARGE)
    const [ paymentMethodReq, setPaymentMethodReq ] = useState(null)
    const history = useHistory()
    const orders = useSelector(state => state.orders)
    const stripe = useStripe()
    const elements = useElements()


    const handleSubmit = async (event) => {
        event.preventDefault()

        const orderlist = orders.map(orderItem => {
            return {
                item: orderItem.item,
                quantity: orderItem.quantity,
                price: parseFloat(orderItem.price)
            }
        })
        const price = orders.reduce((total, order) => {
            return total + parseFloat(order.price)
          }, 0)
        const ordered = true
        const user = props.userID
        const amount = parseFloat(price) * 100

        try {
            await createDeliver({  variables: { orderlist, price, ordered, user } })
            await stripeCharge({ variables: { amount } })

            var request = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            })
    
            setPaymentMethodReq(request)
        } catch (error) {
            console.log(error)
        }
        
        setTimeout(() => history.push('/delivering'), 5000)
    }

    useEffect(() => {
        if (result_deliver.data) {
            dispatch({
                type: 'DELIVER_ID',
                data: {
                    id: result_deliver.data.createDeliver.id
                }
            })
        }

        const fetchData = async () => {
            if (paymentMethodReq) {
                await stripe.confirmCardPayment(result_stripe.data.stripeCharge.clientSecret, {
                    payment_method: paymentMethodReq.paymentMethod.id
                })
            }
        }
        fetchData()
    }, [result_deliver.data, result_stripe.data, paymentMethodReq])

    const cardElementOptions = {
        style: {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                  color: '#aab7c4'
                }
              },
              invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
              }
        },
        hidePostalCode: true
    }


    return (
        <div className='form-checkout-bigger'>
            <h2>Checkout Form</h2>
            <br /><br />
            <form onSubmit={handleSubmit} className="form-checkout">
                <CardElement options={cardElementOptions} />
                <button type='submit'>Deliver Now</button>
            </form>
        </div>
    )
}



export default Checkout