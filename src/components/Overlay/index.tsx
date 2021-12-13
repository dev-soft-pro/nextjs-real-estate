import React from 'react'

interface OverlayProps {
  children?: React.ReactNode
  containerProps?: any
}

export default function Overlay({ children, containerProps }: OverlayProps) {
  return (
    <div className='th-overlay' {...containerProps}>
      {children}
      <style jsx>{`
        .th-overlay {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
        }
      `}</style>
    </div>
  )
}

Overlay.defaultProps = {
  containerProps: {}
}
