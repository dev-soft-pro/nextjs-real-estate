import { connect } from 'react-redux'
import AuthLock from './AuthLock'

const mapStateToProps = (state: TopHap.StoreState) => ({
  authenticated: state.user.isAnonymous === false
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(AuthLock)
