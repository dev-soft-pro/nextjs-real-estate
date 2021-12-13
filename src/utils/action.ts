/**
 * utils for redux actions and creators
 */
export const request = (type: string) => `${type}/request`
export const success = (type: string) => `${type}/success`
export const failure = (type: string) => `${type}/failure`

export const requestCreator = (type: string, payload?: any) => ({
  type: request(type),
  payload
})

export const successCreator = (type: string, payload?: any) => ({
  type: success(type),
  payload
})

export const failureCreator = (type: string, payload?: any) => ({
  type: failure(type),
  payload
})

export const originalType = (type: string) => type.substr(0, type.length - 8) // 8 is length of '/request', '/success', '/failure'
