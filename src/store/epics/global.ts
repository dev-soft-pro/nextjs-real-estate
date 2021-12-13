import { Epic, StateObservable } from 'redux-observable'
import { filter, map } from 'rxjs/operators'
import { Creators } from 'store/actions/global'
import analytics, { logEvent } from 'services/analytics'
import notification, { NotificationShowOption } from 'utils/notification'
import { originalType } from 'utils/action'

const updateAsyncActionStatusEpic: Epic = (
  actions$,
  state: StateObservable<TopHap.StoreState>
) =>
  actions$.pipe(
    filter(
      action =>
        action.type.endsWith('/request') ||
        action.type.endsWith('/success') ||
        action.type.endsWith('/failure')
    ),
    map(action => {
      analytics(action)

      if (action.type.endsWith('/request')) {
        return Creators.updateAsyncActionStatus({
          [originalType(action.type)]: 'request'
        })
      } else if (action.type.endsWith('/success')) {
        return Creators.updateAsyncActionStatus({
          [originalType(action.type)]: 'success'
        })
      } else if (action.type.endsWith('/failure')) {
        const stage = state.value.global.customerOptions.stage
        const { err, showAlert } = action.payload

        if (err) {
          if (stage === 'prod' ? showAlert === true : showAlert !== false) {
            notification.show({
              type: err.level || 'error',
              title: err.title || 'Error...',
              message: err.message
            } as NotificationShowOption)
          }

          if (stage === 'prod' && showAlert !== false) {
            logEvent(
              'err',
              err.message === 'Internal Server Error!'
                ? 'internal_error'
                : 'err',
              null,
              { err }
            )
          }
        }
        return Creators.updateAsyncActionStatus({
          [originalType(action.type)]: 'failure',
          err
        })
      }
    })
  )

export default [updateAsyncActionStatusEpic]
