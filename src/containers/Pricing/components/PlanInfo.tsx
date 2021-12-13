import React from 'react'
import cn from 'classnames'

import Button from 'components/Button'
import { Plan } from 'consts/plan'

export interface PlanInfoProps {
  children?: React.ReactNode
  currentRole?: TopHap.UserRole
  currentPlan: string | null | undefined
  period: 'month' | 'annual'
  plan: Plan
  onSelect(): void
  onCancel?(): void
}

export default function PlanInfo({
  children,
  currentRole,
  currentPlan,
  period,
  plan,
  onSelect,
  onCancel
}: PlanInfoProps) {
  let btnTitle = 'Get Started'

  if (currentPlan && currentRole !== 'free') {
    btnTitle = 'Change'
  }

  const isSelected = currentPlan === plan.id

  return (
    <div
      className={cn('th-plan-info', { 'th-recommended': plan.recommend })}
      style={{ background: plan.color }}
    >
      <h5 className='th-plan-role'>{plan.name}</h5>
      {plan.role === 'free' ? (
        <h5 className='th-price'>Free</h5>
      ) : (
        <>
          <div className='th-price'>${plan.monthlyPrice.toFixed(2)}</div>
          <div className='th-price-unit'>USD/month</div>

          <div className='th-period'>
            Billed {period === 'month' ? 'monthly' : 'annually'}
          </div>
        </>
      )}

      <div className='th-features'>{children}</div>

      {isSelected &&
        (currentPlan ? (
          <Button className='th-cancel-button' onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <span className='th-description'>You are a basic member now</span>
        ))}
      {!isSelected && (
        <Button className='th-select-button' onClick={onSelect}>
          {btnTitle}
        </Button>
      )}
    </div>
  )
}
