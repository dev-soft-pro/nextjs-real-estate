import { combineEpics } from 'redux-observable'
import global from './global'
import user from './user'
import properties from './properties'
import compare from './compare'

export default combineEpics(...global, ...user, ...properties, ...compare)
