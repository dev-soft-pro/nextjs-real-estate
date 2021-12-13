import { connect } from 'react-redux'
import Confirm from './Confirm'
import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status
})

const mapDispatchToProps = {
  confirmUser: Creators.confirmUser
}

export default connect(mapStateToProps, mapDispatchToProps)(Confirm)
