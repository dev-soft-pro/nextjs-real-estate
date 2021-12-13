import { connect } from 'react-redux'
import Authentication from './Authentication'
import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  authenticated: state.user.isAnonymous === false
})

const mapDispatchToProps = {
  signIn: Creators.signIn,
  signInWithGoogle: Creators.signInWithGoogle,
  signInWithFacebook: Creators.signInWithFacebook,
  resendConfirm: Creators.resendConfirm
}

export default connect(mapStateToProps, mapDispatchToProps)(Authentication)
