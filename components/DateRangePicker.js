import DayPickerInput from 'react-day-picker/DayPickerInput'
import { DateUtils } from 'react-day-picker'
import 'react-day-picker/lib/style.css'
import dateFnsFormat from 'date-fns/format'
import dateFnsParse from 'date-fns/parse'
import { useState } from 'react'

const parseDate = (str, format, locale) => {
  const parsed = dateFnsParse(str, format, new Date(), { locale })
  return DateUtils.isDate(parsed) ? parsed : null
}

const formatDate = (date, format, locale) =>
  dateFnsFormat(date, format, { locale })

const format = 'dd MMM yyyy'

//set today and tomorrow date, which will be passed as state initial value (passed as prop) => when the page is loaded check-in and check-out default dates are today and tomorrow
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

//counts the difference of days between 2 dates
const numberOfNightsBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate) //clone
  const end = new Date(endDate) //clone
  let dayCount = 0
  while (end > start) {
    dayCount++
    start.setDate(start.getDate() + 1)
  }
  return dayCount
}

export default function DateRangePicker({ datesChanged, bookedDates }) {
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(tomorrow)
  console.log(bookedDates)
  //booked dates props are received as a list of strings, which we have to convert into Date object
  bookedDates = bookedDates.map((date) => {
    return new Date(date)
  })
  console.log(bookedDates)
  return (
    <div className="date-range-picker-container">
      <div>
        <label>From:</label>
        {/*input check-in */}
        <DayPickerInput 
          formatDate={formatDate}
          format={format}
          value = {startDate}
          parseDate={parseDate}
          placeholder={`${dateFnsFormat(new Date(), format)}`}
          dayPickerProps={{
            modifiers: {
              disabled: [
                ...bookedDates, 
                {
                  before: new Date() //disabling past dates
                }
            ]
            }
          }}
          onDayChange={(day) => {
            setStartDate(day)
            const newEndDate = new Date(day)
            if (numberOfNightsBetweenDates(day, endDate) <= 1) {
              //if check-out date is before check-in date, a new check-out date is set with check-in date+1 as value
              newEndDate.setDate(newEndDate.getDate() + 1)
              setEndDate(newEndDate)
            }
            datesChanged(day, newEndDate) //we have this var instead of state values, because state values aren't update until next HTML rendered 
          }}  
        />
      </div>
      <div>
        <label>To:</label>
        {/*input check-out */}
        <DayPickerInput 
          formatDate={formatDate}
          format={format}
          value = {endDate}
          parseDate={parseDate}
          placeholder={`${dateFnsFormat(new Date(), format)}`}
          dayPickerProps={{
            modifiers: {
              disabled: [
                startDate, //startDate is not a valid day for checkout
                ...bookedDates, 
                {
                  before: startDate
                }
              ]
            }
          }}
          onDayChange={(day) => {
            setEndDate(day)
            datesChanged(startDate, day)
          }}
        />
      </div>
      <style jsx>
        {`
          .date-range-picker-container div {
            display: grid;
            grid-template-columns: 30% 70%;
            padding: 10px;
          }
          label {
            padding-top: 10px;
          }
        `}
      </style>
      <style jsx global>
        {`
          .DayPickerInput input {
            width: 120px;
            padding: 10px;
            font-size: 16px;
          }
        `}
      </style>
    </div>
  )
}