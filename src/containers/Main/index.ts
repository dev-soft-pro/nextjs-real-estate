import { connect } from 'react-redux'
import Main from './Main'
import { Creators as UICreators } from 'store/actions/ui'
import { Creators as UserCreators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status,
  user: state.user.info,
  feedback: state.ui.feedback,
  viewportWidth: state.ui.viewport.width
})

const mapDispatchToProps = {
  showFeedback: UICreators.showFeedback,
  updateViewport: UICreators.updateViewport,
  getCurrentUserInfo: UserCreators.getCurrentUserInfo,
  getCustomer: UserCreators.getCustomer,
  updateUser: UserCreators.updateStates,
  routeChanged: UserCreators.routeChanged
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)
