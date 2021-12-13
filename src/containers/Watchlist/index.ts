import { connect } from 'react-redux'
import Watchlist from './Watchlist'
import { Creators } from 'store/actions/compare'

const mapStateToProps = (state: TopHap.StoreState) => ({
  comparables: state.compare.comparables
})

const mapDispatchToProps = {
  addComparable: Creators.addComparable,
  removeComparable: Creators.removeComparable,
  estimateForCompare: Creators.estimateForCompare
}

export default connect(mapStateToProps, mapDispatchToProps)(Watchlist)
