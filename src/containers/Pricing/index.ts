import { connect } from 'react-redux'
import Pricing from './Pricing'
import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status,
  user: state.user
})

const mapDispatchToProps = {
  createCustomer: Creators.createCustomer,
  updateCustomer: Creators.updateCustomer,
  createSubscription: Creators.createSubscription,
  updateSubscription: Creators.updateSubscription
  // deleteSubscription: Creators.deleteSubscription
}

export default connect(mapStateToProps, mapDispatchToProps)(Pricing)
