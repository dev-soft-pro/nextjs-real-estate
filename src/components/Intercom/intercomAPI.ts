export default function intercomAPI(method: string, ...args: Array<any>) {
  if (window && window.Intercom) {
    window.Intercom.apply(null, [method, ...args])
  } else {
    console.warn('Intercom not initialized yet')
  }
}
