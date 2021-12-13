import { connect } from 'react-redux'
import SignUpSuccess from './SignUpSuccess'
import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status,
  stage: state.global.customerOptions.stage,
  user: state.user.info
})

const mapDispatchToProps = {
  resendConfirm: Creators.resendConfirm
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUpSuccess)
