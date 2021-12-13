import { connect } from 'react-redux'
import RequestInfo from './RequestInfo'
import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status,
  user: state.user.info
})

const mapDispatchToProps = {
  sendFeedback: Creators.sendFeedback
}

export default connect(mapStateToProps, mapDispatchToProps)(RequestInfo)
