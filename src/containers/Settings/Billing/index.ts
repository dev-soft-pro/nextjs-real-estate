import { connect } from 'react-redux'
import Billing from './Billing'
import { Creators } from 'store/actions/user'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status,
  user: state.user
})

const mapDispatchToProps = {
  addCoupon: Creators.addCoupon,
  createCustomer: Creators.createCustomer,
  updateCustomer: Creators.updateCustomer,
  // deleteSource: Creators.deleteSource,
  deleteSubscription: Creators.deleteSubscription,
  getInvoices: Creators.getInvoices,
  getUpcomingInvoice: Creators.getUpcomingInvoice
}

export default connect(mapStateToProps, mapDispatchToProps)(Billing)
