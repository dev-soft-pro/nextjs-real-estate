import React from 'react'

import Button from 'components/Button'

interface EnterprisePlanInfoProps {
  children?: React.ReactNode
  onClick(event?: React.MouseEvent<HTMLDivElement, MouseEvent>): void
}

export default function EnterprisePlanInfo({
  children,
  onClick
}: EnterprisePlanInfoProps) {
  return (
    <div className={'th-plan-info th-enterprise-plan'} onClick={onClick}>
      <h5 className='th-plan-role'>Enterprise</h5>
      <p className='th-description'>
        Please contact us to discuss your enterpise needs
      </p>

      <div className='th-features'>{children}</div>

      <Button className='th-select-button'>Contact Us</Button>
    </div>
  )
}
