import Head from 'next/head'
import Layout from '../../components/Layout.js'
import DateRangePicker from '../../components/DateRangePicker'
import { useStoreState, useStoreActions } from 'easy-peasy'
import { useState, useEffect } from 'react'
import Cookies from 'cookies'
import { House as HouseModel } from '../../model.js'
import axios from 'axios'

const calcNumberOfNightsBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate) //clone
  const end = new Date(endDate) //clone
  let dayCount = 0

  while (end > start) {
    dayCount++
    start.setDate(start.getDate() + 1)
  }

  return dayCount
}

//get the list of booked dates for a house id
const getBookedDates = async (id) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/houses/booked',
      { houseId: id }
    )
    if (response.data.status === 'error') {
      alert(response.data.message)
      return
    }
    return response.data.dates
  } catch (error) {
    console.error(error)
    return
  }
}

//check if the requested dates are avaiable
const canReserve = async (houseId, startDate, endDate) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/houses/check',
      { houseId, startDate, endDate }
    )
    if (response.data.status === 'error') {
      alert(response.data.message)
      return
    }

    if (response.data.message === 'busy') return false
    return true
  } catch (error) {
    console.error(error)
    return
  }
}


export default function House( { house, nextbnb_session, bookedDates }) {
  const [dateChosen, setDateChosen] = useState(false)
  const [numberOfNightsBetweenDates, setNumberOfNightsBetweenDates] = useState(0)
  const setShowLoginModal = useStoreActions(
    (actions) => actions.modals.setShowLoginModal
  )
  const setLoggedIn = useStoreActions((actions) => actions.login.setLoggedIn)
  const loggedIn = useStoreState((state) => state.login.loggedIn)
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()

  useEffect(() => {
    if (nextbnb_session) {
      setLoggedIn(true)
    }
  }, [])

  return (
    <Layout content ={
        <div className="container">
            <Head>
                <title>{house.title}</title>
            </Head>
            <article>
                <img src={house.picture} width="100%" alt="House picture" />
                <p>
                    {house.type} - {house.town}
                </p>
                <p>{house.title}</p>
            </article>
            <aside>
                <h2>Choose a date</h2>
                <DateRangePicker 
                  datesChanged={(startDate, endDate) => {
                    //store number of nights between dates in state, so we'll be able to show the price 
                    setNumberOfNightsBetweenDates(
                      calcNumberOfNightsBetweenDates(startDate, endDate)
                    )
                    setDateChosen(true)
                    setStartDate(startDate)
                    setEndDate(endDate)
                  }}
                  bookedDates = {bookedDates}
                />
                {
                  dateChosen && (
                    <div>
                      <h2>Price per night</h2>
                      <p>${house.price}</p>
                      <h2>Total price for booking</h2>
                      <p>${(numberOfNightsBetweenDates * house.price).toFixed(2)}</p>
                    {
                      loggedIn ? (
                        <button
                          className="reserve"
                          onClick={ async () => {
                            if (!(await canReserve(house.id, startDate, endDate))) {
                              alert('The dates chosen are not valid')
                              return
                            }
                            try {
                              const response = await axios.post('/api/reserve', {
                                houseId: house.id,
                                startDate,
                                endDate
                              })
                              if (response.data.status === 'error') {
                                alert(response.data.message)
                                return
                              }
                              console.log(response.data)

                            } catch (error) {
                              console.log(error)
                              return
                            }
                          }}
                        >
                          Reserve
                        </button>
                      ) : (
                        <button
                          className="reserve"
                          onClick={() => {
                            setShowLoginModal()
                          }}
                        >
                          Login to reserve
                        </button>
                      )
                    }
                    </div>
                  )
                }                
            </aside>
            <style jsx>{`
            .container {
              display: grid;
              grid-template-columns: 60% 40%;
              grid-gap: 30px;
            }

            aside {
              border: 1px solid #ccc;
              padding: 20px;
            }
            button {
              background-color: rgb(255, 90, 95);
              color: white;
              font-size: 13px;
              width: 100%;
              border: none;
              height: 40px;
              border-radius: 4px;
              cursor: pointer;
            }
          `}</style>

        </div>
        }
    />
    )
  }

export async function getServerSideProps({ req, res, query }) {
    //This function gets a context object which has the query property
    //We just need this at the moment, so we can use object destructuring to retrieve it in the parameters => query = {id: idvalue}
    const { id } = query
    const cookies = new Cookies(req, res)
    const nextbnb_session = cookies.get('nextbnb_session')
    const house = await HouseModel.findByPk(id) //get house from id
    const bookedDates = await getBookedDates(id)

    return { props: {
        //house: houses.filter((house)=> house.id === parseInt(id))[0], //nb 0 is because filter returns an array (in this case, the array has one element and we  extract it with [0])
        house: house.dataValues,
        nextbnb_session: nextbnb_session || null,
        bookedDates
      } }
  }