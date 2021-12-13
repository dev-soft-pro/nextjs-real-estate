import { connect } from 'react-redux'
import SignUp from './SignUp'
import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status
})

const mapDispatchToProps = {
  signUp: Creators.signUp,
  signInWithGoogle: Creators.signInWithGoogle,
  signInWithFacebook: Creators.signInWithFacebook
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp)
