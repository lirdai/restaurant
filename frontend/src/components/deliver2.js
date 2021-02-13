import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useHistory } from "react-router-dom"
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



const DeliverSecond = () => {
    const dispatch = useDispatch()
    const [ createDeliver, result_deliver ] = useMutation(CREATE_DELIVER)
    const [ stripeCharge, result_stripe ] = useMutation(STRIPE_CHARGE)
    const orders = useSelector(state => state.orders)
    const history = useHistory()
    const stripe = useStripe()
    const elements = useElements()
    const [ paymentMethodReq, setPaymentMethodReq ] = useState(null)


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
        const email = event.target.email.value
        const phone = event.target.phone.value
        const street = event.target.street.value
        const street2 = event.target.street2.value
        const city = event.target.city.value
        const postal_code = event.target.postal_code.value
        const amount = parseFloat(price) * 100
        
        const billingDetails = {
            name: "Daisy",
            email: email,
            phone: phone,
            address: {
                city: city,
                line1: street,
                line2: street2,
                state: "ON",
                postal_code: postal_code
            }
        }

        try {
            await createDeliver({  variables: { orderlist, price, ordered, email, phone, street, street2, city, postal_code } })
            await stripeCharge({ variables: { amount } })
            // console.log("done")

            var request = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
                billing_details: billingDetails
            })
    
            setPaymentMethodReq(request)
        } catch (error) {
            // console.log(error)
        }

        event.target.email.value = ''
        event.target.phone.value = ''
        event.target.street.value = ''
        event.target.street2.value = ''
        event.target.city.value = ''
        event.target.postal_code.value = ''

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
        <div className='reservation2-bigger'>
            <form className='reservation2-grid' onSubmit={handleSubmit}>
                <input type='text' name='email' placeholder='E-mail' />
                <input type='text' name='phone' placeholder='Phone' />
                <input type='text' name='street' placeholder='Street' />
                <input type='text' name='street2' placeholder='Street2' />
                <input type='text' name='city' placeholder='City' />
                <input type='text' name='postal_code' placeholder='Postal Code' />

                <CardElement options={cardElementOptions} />

                <input type='submit' value='Deliver Now' />
            </form>

             {/* Users */}
            <small className='mt-3'>want to <Link to="/login">login</Link> ?</small>
            <small>Register as a <Link to="/register">user</Link>?</small>
        </div>
    )
}



export default DeliverSecond