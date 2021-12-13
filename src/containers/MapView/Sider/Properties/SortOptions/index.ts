import { connect } from 'react-redux'
import SortOptions from './SortOptions'
import { Creators } from 'store/actions/preferences'

const mapStateToProps = (state: TopHap.StoreState) => ({
  sort: state.preferences.sort
})

const mapDispatchToProps = {
  setOption: Creators.setOption
}

export default connect(mapStateToProps, mapDispatchToProps)(SortOptions)
