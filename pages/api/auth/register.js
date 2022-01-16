import {User, House} from '../../../model.js'
import Cookies from 'cookies'

const randomString = (length) => { //create randomical string which we'll use as session_token
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = ''
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
  }

export default async (req, res) =>{
    if (req.method !== 'POST'){ //filter out all requests with methods different from POST
        res.status(405).end() //Method Not Allowed
        return
      }
    //House.sync() we have used it to create the table, now it's no necessary anymore
    
    //console.log(req.body)

    const { email, password, passwordconfirmation } = req.body

    if (password !== passwordconfirmation) {
        res.end(
          JSON.stringify({ status: 'error', message: 'Passwords do not match' })
        )
        return
      }
    //if the req (from RegistrationModal.js) has POST method, the pwds match, and user email doesn't exist already,
    //an instance of User class is created with data input => a row in the table db is created (.create)
    let user = await User.findOne({ where: { email } })

    if (!user){
        user = await User.create({ email, password })
        //create session token and add it to the user registered in the db. The expiration day of the token is set 30 days from the 
        //current date
        const sessionToken = randomString(255)
        const d = new Date()
        d.setDate(d.getDate() + 30)

        User.update(
        {
            session_token: sessionToken,
            session_expiration: d
        },
        { where: { email } }
        )
        
        const cookies = new Cookies(req, res)
        cookies.set('nextbnb_session', sessionToken, {
            httpOnly: true // true by default
        })
        res.end(JSON.stringify({ status: 'success', message: 'User added' }))

    } else {
        res.end(JSON.stringify({ status: 'error', message: 'User already exists' }))
    }
}