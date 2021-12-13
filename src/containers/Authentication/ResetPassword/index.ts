import { connect } from 'react-redux'
import ResetPassword from './ResetPassword'
import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status
})

const mapDispatchToProps = {
  resetPassword: Creators.resetPassword
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword)
