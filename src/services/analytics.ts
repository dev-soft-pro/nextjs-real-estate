import { AnyAction } from 'redux'
import { IntercomAPI } from 'components/Intercom'
import { googleAnalyticsId } from 'configs'
import { Types as UserTypes } from 'store/actions/user'
import { store } from 'store/setup'
import { success } from 'utils/action'
import invokeApi from 'utils/invokeApi'
import api from 'configs/api'

export function logEventToES(
  category: string,
  action: string,
  subAction?: string | null,
  payload?: object
) {
  if (!store) return

  const state = store.getState()
  const user = state.user.info

  invokeApi({
    baseUrl: api.baseUrl,
    endpoint: api.users.logEvent,
    method: 'POST',
    body: {
      data: btoa(
        JSON.stringify({
          event: { category, action, subAction, payload },
          window: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          url: {
            full: window.location.href,
            scheme: window.location.protocol.replace(':', ''),
            domain: window.location.hostname,
            path: window.location.pathname,
            fragment: window.location.hash
              ? window.location.hash.replace('#', '')
              : undefined,
            query: window.location.search
              ? window.location.search.replace('?', '')
              : undefined
          },
          user: {
            email: user.email || '',
            displayName: user.displayName || '',
            username: user.username || '',
            uid: user.uid || ''
          },
          referrer: document.referrer
        })
      )
    }
  })
    // eslint-disable-next-line
    .then(res => {})
    .catch(console.error)
}

export function logEvent(
  category: string,
  action: string,
  subAction?: string | null,
  payload?: object
) {
  let actionName = action
  if (subAction) actionName += '_' + subAction

  if (window.gtag) {
    window.gtag('event', actionName, {
      event_category: category,
      ...(payload || {})
    })
  }

  IntercomAPI('trackEvent', actionName, {
    category,
    action,
    sub_action: subAction,
    payload
  })

  logEventToES(category, action, subAction, payload)
}

export function trackPageView(url: string) {
  try {
    window.gtag('config', googleAnalyticsId, {
      page_location: url
    })

    IntercomAPI('trackEvent', 'location_change', {
      page_location: url
    })

    logEventToES('location_change', 'location_change', url)
  } catch (err) {}
}

export default function analytics(action: AnyAction) {
  switch (action.type) {
    case success(UserTypes.SIGN_IN):
      logEvent('engagement', 'login', null, { method: 'Email' })
      break
    case success(UserTypes.SIGN_IN_WITH_GOOGLE):
      if (action.payload.isFirstSignIn) {
        logEvent('engagement', 'sign_up', null, { method: 'Google' })
      } else {
        logEvent('engagement', 'login', null, { method: 'Google' })
      }
      break
    case success(UserTypes.SIGN_IN_WITH_FACEBOOK):
      if (action.payload.isFirstSignIn) {
        logEvent('engagement', 'sign_up', null, { method: 'Facebook' })
      } else {
        logEvent('engagement', 'login', null, { method: 'Facebook' })
      }
      break
    case success(UserTypes.SIGN_UP):
      logEvent('engagement', 'sign_up', null, { method: 'Email' })
      break
    case success(UserTypes.UPDATE_PROFILE):
      logEvent('engagement', 'profile_edit')
      break
  }
}
