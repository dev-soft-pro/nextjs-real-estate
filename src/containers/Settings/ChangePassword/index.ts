import ChangePassword from './ChangePassword'
import { connect } from 'react-redux'

import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status,
  user: state.user.info
})

const mapDispatchToProps = {
  updatePassword: Creators.updatePassword
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword)
