import { connect } from 'react-redux'
import Settings from './Settings'

const mapStateToProps = (state: TopHap.StoreState) => ({
  isAnonymous: state.user.isAnonymous,
  passwordResettable: state.user.providerId === 'password',
  stage: state.global.customerOptions.stage
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
