
import { Booking } from '../../../model.js'
import { Sequelize } from 'sequelize'

//this endpoint receives an house id and return the corresponding list of booked dates
const getDatesBetweenDates = (startDate, endDate) => {//return the list of dates between two dates
  let dates = []
  while (startDate < endDate) {
    dates = [...dates, new Date(startDate)]
    startDate.setDate(startDate.getDate() + 1)
  }
  dates = [...dates, endDate]
  return dates
}

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end() //Method Not Allowed
    return
  }
  const houseId = req.body.houseId //this endpoint receives the house id from the request

  const results = await Booking.findAll({ //return records of bookings for house with requested id
    where: {
      houseId: houseId,
      endDate: {
        [Sequelize.Op.gte]: new Date() //this option in this context means that the end date is in the future compared to today’s date
      }
    }
  })

  let bookedDates = []

  for (const result of results) { //for every result row put the start date, the end date and dates between them in a list
    const dates = getDatesBetweenDates(
      new Date(result.startDate),
      new Date(result.endDate)
    )

    bookedDates = [...bookedDates, ...dates]
  }

  //remove duplicates from the list
  bookedDates = [...new Set(bookedDates.map((date) => date))]

  res.json({
    status: 'success',
    message: 'ok',
    dates: bookedDates
  })
}