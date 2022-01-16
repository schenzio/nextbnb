import { Booking } from '../../../model.js'
import { Sequelize } from 'sequelize'

//this endpoint check if the requested dates for a house are already booked
const canBookThoseDates = async (houseId, startDate, endDate) => {
    const results = await Booking.findAll({
      where: {
        houseId: houseId,
        /*determine if the two data ranges overlap:
        no overlap = start date of a booking is after the end date we look for or end date of a booking is before the starting date we want to check
        this query finds the data ranges overlap
        */
        startDate: { //check if the start date of a booking is before the requested end date (lte stands for <)
          [Sequelize.Op.lte]: new Date(endDate) 
        },
        endDate: { //check if the end date of a booking is after the requested start date (gte stands for >)
          [Sequelize.Op.gte]: new Date(startDate)
        }
      }
    })
    return !(results.length > 0) //if there are results the house is busy, so return false
  }

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end() //Method Not Allowed
    return
  }
  const startDate = req.body.startDate
  const endDate = req.body.endDate
  const houseId = req.body.houseId

  let message = 'free'
  //if the house is busy modifies the message
  if (!(await canBookThoseDates(houseId, startDate, endDate))) {
    message = 'busy'
  }

  res.json({
    status: 'success',
    message: message
  })
}