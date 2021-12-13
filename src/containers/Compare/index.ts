import { connect } from 'react-redux'
import Compare from './Compare'
import { Creators } from 'store/actions/compare'

const mapStateToProps = (state: TopHap.StoreState) => ({
  asyncStatus: state.global.status,
  comparables: state.compare.comparables,
  dateOption: state.compare.preferences.dateOption,
  preferences: state.compare.preferences
})

const mapDispatchToProps = {
  setState: Creators.setState,
  addComparables: Creators.addComparables,
  updateComparables: Creators.updateComparables,
  removeComparable: Creators.removeComparable
}

export default connect(mapStateToProps, mapDispatchToProps)(Compare)
