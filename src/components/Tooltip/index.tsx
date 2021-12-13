import React from 'react'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import MaterialTooltip, {
  TooltipProps as MaterialTooltipProps
} from '@material-ui/core/Tooltip'

import styles from './styles.scss?type=global'

interface TooltipProps {
  placement?: MaterialTooltipProps['placement']
  tooltip: React.ReactNode
  trigger: 'click' | 'hover'
  wrap: boolean
  children: React.ReactNode
}

export default function Tooltip({
  children,
  placement,
  tooltip,
  trigger,
  wrap
}: TooltipProps) {
  const [isOpen, setOpen] = React.useState(false)

  if (!tooltip)
    return wrap ? <div>{children}</div> : (children as React.ReactElement)

  function close() {
    setOpen(false)
  }

  function open() {
    setOpen(true)
  }

  const commonProps = {
    classes: {
      tooltip: 'th-tooltip-overlay',
      popper: 'th-tooltip-popper'
    },
    placement,
    title: (
      <>
        {tooltip}
        <span className='th-tooltip-arrow' />
      </>
    ),
    disableFocusListener: false
    // PopperProps: {
    //   popperOptions: {
    //     modifiers: {
    //       arrow: {
    //         enabled: Boolean(refArrow.current),
    //         element: refArrow.current
    //       }
    //     }
    //   }
    // }
  }

  if (trigger === 'click') {
    return (
      <ClickAwayListener onClickAway={close}>
        <div style={{ display: 'inline-block' }}>
          <MaterialTooltip
            {...commonProps}
            PopperProps={{
              disablePortal: true
            }}
            onClose={close}
            open={isOpen}
            disableHoverListener
            leaveTouchDelay={0}
          >
            <div className={'th-tooltip-trigger'} onClick={open}>
              {children}
            </div>
          </MaterialTooltip>
          <style jsx>{styles}</style>
        </div>
      </ClickAwayListener>
    )
  } else {
    return (
      <>
        <MaterialTooltip {...commonProps} disableTouchListener={false}>
          {wrap ? <div>{children}</div> : (children as React.ReactElement)}
        </MaterialTooltip>
        <style jsx>{styles}</style>
      </>
    )
  }
}

Tooltip.defaultProps = {
  trigger: 'click',
  wrap: true
}
