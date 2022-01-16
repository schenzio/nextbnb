import houses from '../houses.js' //json data of houses
import House from '../components/House.js' //component which renders single house in the list
import Layout from '../components/Layout.js'
import Cookies from 'cookies'
import { useStoreActions } from 'easy-peasy'
import { useEffect } from 'react' //we use useEffect to check if this prop is available, and if so, we call the setLoggedIn state action
import { House as HouseModel } from '../model.js'

export default function Home({ nextbnb_session, houses }) {
  const setLoggedIn = useStoreActions((actions) => actions.login.setLoggedIn)
  useEffect(() => {
    if ( nextbnb_session ) {
      setLoggedIn(true)
    }
  }, [])
  return <Layout content={
    <div> 
    <h2>Places to stay</h2>
    <div className="houses">
      {houses.map((house, index) =>{//all house properties are passed as props
        return <House key={index} {...house} /> 
      })}
    </div>{/*special tag style jsx define scope CSS which applies only to the component in which it is defined */}
    <style jsx>{`
      .houses {
        display: grid;
        grid-template-columns: 49% 49%;
        grid-template-rows: 300px 300px;
        grid-gap: 2%;
      }
      `}
    </style>
  </div>
  } />
}

//make the nextbnb_session prop available in the component (Home)
export async function getServerSideProps({ req, res, query }) {
  const cookies = new Cookies(req, res)
  const nextbnb_session = cookies.get('nextbnb_session')
  const houses = await HouseModel.findAndCountAll()
  return {
    props: {
      nextbnb_session: nextbnb_session || null,
      houses: houses.rows.map((house) => house.dataValues) //iterate through rows getting the dataValues property, which returns 
      //a plain JS object with the data we need
    }
  }
}
