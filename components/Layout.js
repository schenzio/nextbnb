import Header from "./Header";
import { useState } from 'react'
import Head from 'next/head'
import Modal from './Modal'
import RegistrationModal from "./RegistrationModal";
import LoginModal from "./LoginModal";
import { useStoreState, useStoreActions } from 'easy-peasy'

export default function Layout(props) {
    //const [showModal, setShowModal] = useState(false) //true is the initial value of state, showModal, so at first modal is displayed
    // [showLoginModal, setShowLoginModal] = useState(false)
    //const [showRegistrationModal, setShowRegistrationModal] = useState(false)

    //the state properties
    const showModal = useStoreState((state) => state.modals.showModal)
    const showLoginModal = useStoreState((state) => state.modals.showLoginModal)
    const showRegistrationModal = useStoreState(
      (state) => state.modals.showRegistrationModal
    )
    //the state function to change the state value
    const setHideModal = useStoreActions((actions) => actions.modals.setHideModal)
    const setShowRegistrationModal = useStoreActions(
      (actions) => actions.modals.setShowRegistrationModal
    )
    const setShowLoginModal = useStoreActions(
      (actions) => actions.modals.setShowLoginModal
    )
    
    return (
      <div>
        {/* add the Stripe frontend code 
        <Head>
          <script src='https://js.stripe.com/v3/'></script>
        </Head>*/}
        <Header />
        <main>{props.content}</main>
        {
          showModal && (
            <Modal close={() => setHideModal()}>
              {showLoginModal && 
              <LoginModal 
                showSignup={() => {
                  setShowRegistrationModal()
                }}/>
              }
              {showRegistrationModal && 
                <RegistrationModal 
                  showLogin ={()=>{
                    setShowLoginModal()
                  }}
                />
              }
            </Modal>
          )
        }
        <style jsx>{`
            main {
            position: relative;
            max-width: 56em;
            background-color: white;
            padding: 2em;
            margin: 0 auto;
            box-sizing: border-box;
            }
        `}</style>
      </div>
    )
  }