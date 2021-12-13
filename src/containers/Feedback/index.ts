import Feedback from './Feedback'
import { connect } from 'react-redux'

import { Creators as UserCreators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => {
  return {
    asyncStatus: state.global.status,
    user: state.user.info
  }
}

const mapDispatchToProps = {
  sendFeedback: UserCreators.sendFeedback
}

export default connect(mapStateToProps, mapDispatchToProps)(Feedback)
