import { useEffect, useState, useRef } from 'react'

export function useIsMounted() {
  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])
  return isMounted
}

export function useInputState(initialValue: any) {
  const [value, onChange] = useState(initialValue)

  return [value, (e: any) => onChange(e && e.target ? e.target.value : e)]
}
