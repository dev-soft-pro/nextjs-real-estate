import { createStore, applyMiddleware, compose, Store } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { MakeStoreOptions } from 'next-redux-wrapper'

import { getInitState as globalInitState } from './reducers/global'
import { getInitState as uiInitState } from './reducers/ui'
import rootReducer from './reducers'
import rootEpic from './epics'

let store: Store<TopHap.StoreState>
function setupStore(initialState: any, options: MakeStoreOptions) {
  // construct initial state
  if (!initialState) {
    if (options.req) {
      const host = options.req.headers['host'] as string
      const ua = options.req.headers['user-agent'] as string
      const global = globalInitState(host, ua)
      initialState = {
        global,
        ui: uiInitState(global.isMobile)
      }
    }
  }

  // middlewares
  const epicMiddleware = createEpicMiddleware()
  const middlewares = [epicMiddleware]

  // redux devtool extension
  const composeEnhancers =
    typeof window === 'undefined' || process.env.NODE_ENV === 'production'
      ? compose
      : (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  )

  // TODO: run only necessary epic for each page.
  // run epics
  epicMiddleware.run(rootEpic)

  return store
}

export default setupStore
export { store }
