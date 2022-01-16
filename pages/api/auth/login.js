import { User, sequelize } from '../../../model.js'
import Cookies from 'cookies'

const randomString = (length) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = ''
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
  }

export default async (req, res) => {
//check if request's method is POST
  if (req.method !== 'POST') {
    res.status(405).end() 
    return
  }
  //get input values from request
  const { email, password } = req.body

  //check if user exists
  let user = await User.findOne({ where: { email } })
  if (!user) {
    res.end(JSON.stringify({ status: 'error', message: 'User does not exist' }))
    return
  }

  //check if the pwd is valid (used the method defined in User Class defined in model.js)
  const isPasswordValid = await user.isPasswordValid(password)
  if (!isPasswordValid) {
    res.end(JSON.stringify({ status: 'error', message: 'Password not valid' }))
    return
    }
  //check if the section is expired: if so, we generate a new session token and a new expiration date. If not, we just expand the 
  //expiration date of 30 days
  let sessionToken = null
  const sessionExpiration = new Date()
  sessionExpiration.setDate(sessionExpiration.getDate() + 30) //30 days from current date
  if (new Date(user.session_expiration) < new Date()) { //if old session token is expired, we replace it with new generated session token
    sessionToken = randomString(255)
    User.update(
      {
        session_token: sessionToken,
        session_expiration: sessionExpiration
      },
      { where: { email } }
    )
  } else { //else our session token get the value from the db
    sessionToken = user.session_token
    User.update(
      {
        session_expiration: sessionExpiration
      },
      { where: { email } }
    )
  }

  //create and store the session token in a cookie
  const cookies = new Cookies(req, res)
  cookies.set('nextbnb_session', sessionToken, {
    httpOnly: true // true by default
  })
  
  res.end(JSON.stringify({ status: 'success', message: 'Logged in' }))
}