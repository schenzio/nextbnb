import Link from "next/link"
import { useStoreState, useStoreActions } from 'easy-peasy'
import Cookies from 'cookies'
import { useEffect } from 'react'

export default function Header(props) {
  //initialize the actions and the states we have to use in this component (we get them from store.js)
  const setShowLoginModal = useStoreActions(
    (actions) => actions.modals.setShowLoginModal
  )
  const setShowRegistrationModal = useStoreActions(
    (actions) => actions.modals.setShowRegistrationModal
  )
  const loggedIn = useStoreState((state) => state.login.loggedIn)
  const setLoggedOut = useStoreActions((actions) => actions.login.setLoggedOut)
  useEffect(()=>{
    if ((loggedIn)){
      console.log(props.cookies)
    }
  })
  return (
    <div className="nav-container">
      <Link href="/">
          <a>
              <img src="/img/logo.png" alt="" /> 
          </a>
      </Link>
      { loggedIn ? (
          <nav>
            <ul>
              <li>
                <Link href="/">
                  <a onClick={() => {
                      setLoggedOut()
                      }}>
                    Logout
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
        ) : (
        <nav>
            <ul>
                <li>
                    <Link href="/">
                      <a onClick={() => setShowRegistrationModal()}>
                        Sign up
                      </a>
                    </Link>
                </li>
                <li>
                  <Link href="/">
                      <a onClick={() => setShowLoginModal()}>
                        Log in
                      </a>
                    </Link>
                </li>
            </ul>
        </nav>
        )
      }        
      <style jsx>{`
      ul {
        margin: 0;
        padding: 0;
      }

      li {
        display: block;
        float: left;
      }

      a {
        text-decoration: none;
        display: block;
        margin-right: 15px;
        color: #333;
      }

      nav a {
        padding: 1em 0.5em;
      }

      .nav-container {
        border-bottom: 1px solid #eee;
        height: 50px;
      }

      img {
        float: left;
      }

      ul {
        float: right;
      }
    `}</style>
    </div>
  )
}
export async function getServerSideProps({ req, res, query }) {
  const cookies = req.cookies
  return { props: {
      cookies: cookies
    } }
}