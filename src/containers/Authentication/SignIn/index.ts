import { connect } from 'react-redux'
import SignIn from './SignIn'
import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status
})

const mapDispatchToProps = {
  signIn: Creators.signIn,
  signInWithGoogle: Creators.signInWithGoogle,
  signInWithFacebook: Creators.signInWithFacebook,
  resendConfirm: Creators.resendConfirm
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn)
