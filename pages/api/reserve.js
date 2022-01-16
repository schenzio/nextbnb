import { User, Booking } from '../../model.js'

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end() //Method Not Allowed
    return
  }
  //get user_session_token from cookies and check if it exists
  const user_session_token = req.cookies.nextbnb_session
  if (!user_session_token) {
    res.status(401).end()
    return
  }
  //get the user associated to the session_token from db, then insert booking istance in db
  User.findOne({ where: { session_token: user_session_token } }).then(
    (user) => {
      Booking.create({
        houseId: req.body.houseId,
        userId: user.id,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        sessionId: req.body.sessionId
      }).then(() => {
        res.writeHead(200, {
          'Content-Type': 'application/json'
        })
        res.end(JSON.stringify({ status: 'success', message: 'ok' }))
      })
    }
  )
}