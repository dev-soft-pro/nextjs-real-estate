import fetch from 'isomorphic-unfetch'
import { firebaseAuth } from 'utils/firebase'

export interface ApiConfig {
  baseUrl: string
  endpoint: string
  method: string
  body?: any
  path?: any
  query?: any
  auth?: boolean
}

export default async function invokeApi({
  baseUrl,
  endpoint,
  method = 'get',
  body,
  path,
  query,
  auth = false
}: ApiConfig) {
  let token
  if (auth) {
    const Auth = await firebaseAuth()
    if (Auth.currentUser) token = await Auth.currentUser.getIdToken()
  }

  let url = `${baseUrl}/${endpoint}`
  if (path) {
    Object.keys(path).forEach(key => {
      url = url.replace(`{${key}}`, path[key])
    })
  }

  if (query) {
    url =
      url +
      '?' +
      Object.keys(query).reduce(
        (result, key) => result + `${key}=${encodeURIComponent(query[key])}&`,
        ''
      )
  }

  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token as string
    },
    method,
    body: body && JSON.stringify(body)
  })
    .then(response => {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return response.json().then(content => ({ content, response }))
      } else {
        return response.text().then(content => ({ content, response }))
      }
    })
    .then(({ content, response }) => {
      if (!response.ok) return Promise.reject(content)
      else return content
    })
}
