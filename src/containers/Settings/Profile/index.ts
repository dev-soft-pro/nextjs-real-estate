import { connect } from 'react-redux'
import Profile from './Profile'

import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status,
  user: state.user.info
})

const mapDispatchToProps = {
  closeAccount: Creators.closeAccount,
  updateProfile: Creators.updateProfile
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
