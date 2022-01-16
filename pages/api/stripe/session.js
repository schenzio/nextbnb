//import dotenv from 'dotenv'
//dotenv.config()

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end() //Method Not Allowed
    return
  }

  const amount = req.body.amount //get the amount of money from request
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY) //require stripe
  const session = await stripe.checkout.sessions.create({ //payment object
    payment_method_types: ['card'], //payment accedpted methods
    line_items: [
      { //item purchased
        name: 'Booking house on Airbnb clone',
        amount: amount * 100,
        currency: 'usd',
        quantity: 1
      }
    ],
    //url where user will be redirected to after the purchase
    success_url: process.env.BASE_URL + '/bookings',
    cancel_url: process.env.BASE_URL + '/bookings'
  })
  //return session id and stripe public key
  res.writeHead(200, {
    'Content-Type': 'application/json'
  })
  res.end(
    JSON.stringify({
      status: 'success',
      sessionId: session.id,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY
    })
  )
}