import { connect } from 'react-redux'
import ForgotPassword from './ForgotPassword'
import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status
})

const mapDispatchToProps = {
  forgotPassword: Creators.forgotPassword
}

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword)
