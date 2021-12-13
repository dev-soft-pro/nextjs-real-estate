export function setIn<T>(obj: T, key: string, value: any, update = false) {
  const keys = key.split('.')

  function _setIn(o: T, index: number): T {
    if (keys.length - 1 === index) {
      if (update) {
        return {
          ...o,
          [keys[index]]: {
            // @ts-ignore
            ...o[keys[index]],
            ...value
          }
        }
      } else {
        return {
          ...o,
          [keys[index]]: value
        }
      }
    } else {
      return {
        ...o,
        // @ts-ignore
        [keys[index]]: _setIn(o[keys[index]], index + 1)
      }
    }
  }

  return _setIn(obj, 0)
}
