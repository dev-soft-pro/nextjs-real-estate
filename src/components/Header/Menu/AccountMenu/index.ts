import { connect } from 'react-redux'
import AccountMenu from './AccountMenu'
import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  isMobile: state.global.isMobile.any,
  userProvider: state.user.providerId
})

const mapDispatchToProps = {
  signOut: Creators.signOut
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountMenu)
