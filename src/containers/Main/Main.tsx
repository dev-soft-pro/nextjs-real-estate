import React from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import cn from 'classnames'
import firebase from 'firebase/app'
import debounce from 'lodash/debounce'
import ResizeDetector from 'react-resize-detector'
import { toast } from 'react-toastify'

import AppHeader from 'components/AppHeader'
import Footer from 'components/Footer'
import Header from 'components/Header'
import { ReactIntercom as Intercom } from 'components/Intercom'
import SideMenu from 'components/SideMenu'
import Authentication from 'containers/Authentication'

import { intercomId } from 'configs'
import firebaseConfig from 'configs/firebase'
import { BREAK_SM } from 'consts'
import { MAP_PAGE, COMPARE_PAGE } from 'consts/url'
import { logEvent } from 'services/analytics'
import { Types } from 'store/actions/user'
import { firebaseAuth, firestore } from 'utils/firebase'
import notiStyles from 'utils/notification/styles.scss?type=global'

import styles from 'styles/styles.scss?type=global'
import { TopHapAppProps } from 'types/app'

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

toast.configure({
  autoClose: 5000,
  className: 'th-notification-container'
})

const appPages = [MAP_PAGE, '/map', COMPARE_PAGE, '/compare']
const noFooterPages = [MAP_PAGE, '/map', COMPARE_PAGE, '/compare']

const Feedback = dynamic(() => import('containers/Feedback'))

interface MainAppProps extends TopHapAppProps {
  asyncStatus: TopHap.GlobalState['status']
  feedback: TopHap.UIState['feedback']
  user: TopHap.UserState['info']
  viewportWidth: number
  getCurrentUserInfo: TopHap.UserCreators['getCurrentUserInfo']
  getCustomer: TopHap.UserCreators['getCustomer']
  routeChanged: TopHap.UserCreators['routeChanged']
  updateUser: TopHap.UserCreators['updateStates']
  updateViewport: TopHap.UICreators['updateViewport']
  showFeedback: TopHap.UICreators['showFeedback']
}

export default class Main extends React.Component<MainAppProps> {
  private unsubscribeAuthObserver?: firebase.Unsubscribe
  private unsubscribePaymentObserver?: firebase.Unsubscribe
  private pageYOffset?: number

  state = {
    scrolledDown: false
  }

  componentDidMount() {
    firebaseAuth().then(auth => {
      this.unsubscribeAuthObserver = auth.onAuthStateChanged(
        this.onAuthStateChanged
      )
    })

    document.addEventListener('scroll', this.onScroll)

    Router.events.on('routeChangeComplete', this.onRouteChange)
    Router.events.on('hashChangeComplete', this.onRouteChange)
  }

  componentWillUnmount() {
    if (this.unsubscribePaymentObserver) this.unsubscribePaymentObserver()
    if (this.unsubscribeAuthObserver) this.unsubscribeAuthObserver()

    document.removeEventListener('scroll', this.onScroll)

    Router.events.off('routeChangeComplete', this.onRouteChange)
    Router.events.off('hashChangeComplete', this.onRouteChange)
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('Error', error, errorInfo)
  }

  onAuthStateChanged = async (user: firebase.User | null) => {
    const { asyncStatus } = this.props
    if (this.unsubscribePaymentObserver) this.unsubscribePaymentObserver()

    if (user) {
      this.props.updateUser({
        isAnonymous: user.isAnonymous,
        uid: user.uid,
        providerId: user.providerData.length
          ? user.providerData[0]?.providerId
          : undefined
      })

      if (!user.isAnonymous) {
        localStorage.setItem('TH_AUTHENTICATED', 'true')
        this.props.getCustomer()
      }

      // TODO
      // show sign up when visit map page at first
      // if (
      //   location.pathname.startsWith('/homes') &&
      //   !location.pathname.startsWith('/homes/details')
      // ) {
      //   if (sessionStorage.getItem('TH_FIRST_VISIT') !== 'false') {
      //     const authPath = location.pathname.match(/(.*)\/auth\/(.*)/)
      //     if (!authPath) {
      //       if (this.props.user.isAnonymous === true) {
      //         history.push(this.props.location.pathname + '/auth/signup')
      //       }
      //       sessionStorage.setItem('TH_FIRST_VISIT', 'false')
      //     }
      //   }
      // }

      // subscribe to payment info doc.
      const db = await firestore()
      const paymentRef = db.doc(`users/${user.uid}/private/payment`)
      this.unsubscribePaymentObserver = paymentRef.onSnapshot(snapshot => {
        this.props.updateUser({
          paymentInfo:
            snapshot.data() ||
            (user.isAnonymous === false
              ? {
                  role: 'free'
                }
              : undefined)
        })
      })

      if (
        asyncStatus[Types.SIGN_IN] === 'request' ||
        asyncStatus[Types.SIGN_IN_WITH_GOOGLE] === 'request' ||
        asyncStatus[Types.SIGN_IN_WITH_FACEBOOK] === 'request' ||
        asyncStatus[Types.SIGN_UP] === 'request'
      ) {
        return
      }

      this.props.getCurrentUserInfo()
    } else {
      localStorage.setItem('TH_AUTHENTICATED', 'false')

      firebase
        .auth()
        .signInAnonymously()
        .catch(function(error) {
          console.log('Error while sign in anonymously', error)
        })
    }
  }

  onResize = (width: number, height: number) => {
    this.props.updateViewport({ width, height })
  }

  onRouteChange = (url: string) => {
    this.props.routeChanged(url)
  }

  onScroll = () => {
    const OFFSET = 10

    if (this.pageYOffset !== undefined) {
      if (
        window.pageYOffset > this.pageYOffset + OFFSET &&
        window.pageYOffset > 120
      ) {
        this.setState({ scrolledDown: true })
      } else if (
        window.pageYOffset + OFFSET < this.pageYOffset ||
        window.pageYOffset < 120
      ) {
        if (!document.body.classList.contains('th-disable-header-down')) {
          this.setState({ scrolledDown: false })
        }
      }
    }

    this.onScrollEnd()
  }

  onScrollEnd = debounce(() => {
    this.pageYOffset = window.pageYOffset

    if (Router.pathname === '/') {
      const category = 'landing'
      const percent =
        window.pageYOffset / (document.body.scrollHeight - window.innerHeight)
      if (percent > 0.99) {
        logEvent(category, 'scroll', 'bottom')
      } else if (percent > 0.5) {
        logEvent(category, 'scroll', 'middle')
      } else if (percent > 0.05) {
        logEvent(category, 'scroll', 'top')
      }
    }
  }, 300)

  render() {
    const {
      Component,
      pageProps,
      router,
      user,
      showFeedback,
      feedback,
      viewportWidth
    } = this.props
    const { scrolledDown } = this.state

    const intercom =
      user.isAnonymous === false
        ? {
            email: user.email,
            name: user.displayName,
            user_id: user.uid,
            unsubscribed_from_emails: user.unsubscribed
          }
        : {}

    const isAppPage = appPages.includes(router.pathname)

    return (
      <div className={cn('th-app', { 'th-scrolled-down': scrolledDown })}>
        <style jsx>{styles}</style>
        <style jsx>{notiStyles}</style>

        {isAppPage ? (
          <>
            {viewportWidth <= BREAK_SM && <AppHeader />}
            <SideMenu />
          </>
        ) : (
          <Header transparentable={router.route === '/'} />
        )}

        <div className={cn('th-app-content', { 'th-app-mode': isAppPage })}>
          <Component {...pageProps} />
          {!noFooterPages.includes(router.pathname) && <Footer />}
        </div>

        <Authentication url={router.asPath} />
        {<Intercom app_id={intercomId} {...intercom} /> || null}
        {feedback && (
          <Feedback visible={feedback} onCancel={() => showFeedback(false)} />
        )}

        <ResizeDetector
          handleWidth
          refreshMode='debounce'
          refreshRate={50}
          onResize={this.onResize}
        />
      </div>
    )
  }
}
