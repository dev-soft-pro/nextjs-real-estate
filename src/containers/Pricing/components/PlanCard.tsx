import { useMemo } from 'react'
import capitalize from 'capitalize'
import { features } from 'consts/plan'
import SvgCheck from 'assets/images/icons/check_circle.svg'

interface PlanCardProps {
  role: TopHap.UserRole
  includingRole?: TopHap.UserRole
  infoComponent: React.ReactElement
}

export default function PlanCard({
  role,
  includingRole,
  infoComponent
}: PlanCardProps) {
  const items = useMemo(() => {
    let items: any[] = []
    features.forEach(e => {
      items = [...items, ...e.items.filter(item => item.requireRole === role)]
    })

    return items
  }, [features])

  return (
    <div className='th-plan-card'>
      {infoComponent}
      {includingRole && (
        <p className='th-description'>
          {capitalize(role)} includes
          <br />
          All {capitalize(includingRole)} plan features
          {items.length ? (
            <>
              ,<br />
              <span>in addition to:</span>
            </>
          ) : null}
        </p>
      )}
      <ul>
        {items.map((item, index) => (
          <div key={index} className='th-plan-feature'>
            <SvgCheck />
            {item.title}
          </div>
        ))}
      </ul>
    </div>
  )
}
