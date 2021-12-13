import { connect } from 'react-redux'
import PageHeader from './PageHeader'

const mapStateToProps = (state: TopHap.StoreState) => ({
  keyword: state.preferences.keyword,
  place: state.preferences.place
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader)
