import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import get from 'lodash/get'
import { useRouter } from 'next/router'
import ResizeDetector from 'react-resize-detector'
import Slider from 'react-slick'

import Button from 'components/Button'
import CardInput, { CardData } from 'components/CardInput'
import FAQ from 'components/FAQ'
import Modal from 'components/Modal'
import OverlaySpinner from 'components/OverlaySpinner'
import Tooltip from 'components/Tooltip'

// import EnterprisePlanInfo from './components/EnterprisePlanInfo'
import PeriodPicker, { Period } from './components/PeriodPicker'
import PlanCard from './components/PlanCard'
import PlanInfo from './components/PlanInfo'

import { pricing as faq } from 'consts/faq'
import plans, { id2Plan, features, roleOrders, Plan } from 'consts/plan'
import { logEvent } from 'services/analytics'
import { Types } from 'store/actions/user'
import { showConfirm } from 'utils/message'
import SvgArrow from 'assets/images/landing/arrow.svg'
import SvgCheck from 'assets/images/icons/check_circle.svg'
import SvgClose from 'assets/images/icons/close.svg'

import styles from './styles.scss?type=global'

const roles: TopHap.UserRole[] = ['free', 'pro', 'advanced', 'enterprise']

type Props = {
  title: string
  tooltip?: string
  role: TopHap.UserRole
}

function Feature({ title, tooltip, role }: Props) {
  return (
    <div className='th-feature'>
      <div className='th-title'>
        {title}
        {tooltip && (
          <Tooltip tooltip={tooltip} trigger='hover'>
            <div className='th-feature-tooltip'>ⓘ</div>
          </Tooltip>
        )}
      </div>
      {roles.map(e => (
        <div key={e} className={'th-plan-feature'}>
          {roleOrders[e] >= roleOrders[role] ? (
            <SvgCheck className='th-check-icon' />
          ) : (
            <SvgClose className='th-close-icon' />
          )}
        </div>
      ))}
    </div>
  )
}

function FeaturesHeader({ title }: { title: string }) {
  return (
    <div className='th-feature th-feature-header'>
      <div className='th-title'>{title}</div>
      {roles.map(e => (
        <div key={e} className='th-plan-feature' />
      ))}
    </div>
  )
}

interface PricingProps {
  asyncStatus: TopHap.GlobalState['status']
  user: TopHap.UserState
  createCustomer: TopHap.UserCreators['createCustomer']
  updateCustomer: TopHap.UserCreators['updateCustomer']
  createSubscription: TopHap.UserCreators['createSubscription']
  updateSubscription: TopHap.UserCreators['updateSubscription']
  // deleteSubscription: TopHap.UserCreators['deleteSubscription']
}

export default function Pricing({
  asyncStatus,
  user,
  createCustomer,
  updateCustomer,
  createSubscription,
  updateSubscription
}: // deleteSubscription
PricingProps) {
  const [period, setPeriod] = useState<Period>('annual')
  const [cardModal, showCardModal] = useState(false)
  const [cardMessage, setCardMessage] = useState<React.ReactNode>(null)
  const newPlan = useRef<Plan | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (
      asyncStatus[Types.CREATE_CUSTOMER] === 'success' ||
      asyncStatus[Types.UPDATE_CUSTOMER] === 'success'
    ) {
      if (newPlan.current) {
        createSubscription(newPlan.current.id)
        newPlan.current = null
      }
    }
  }, [
    asyncStatus[Types.CREATE_CUSTOMER] === 'success' ||
      asyncStatus[Types.UPDATE_CUSTOMER] === 'success'
  ])

  function onFree() {
    router.replace({
      pathname: router.pathname,
      query: { auth: 'signup' }
    })
  }

  async function onSelect(plan: Plan) {
    if (user.isAnonymous === false) {
      if (!user.paymentInfo) return

      const { role, plan: currentId } = user.paymentInfo
      let message = null

      if (!currentId) {
        if (period === 'month') {
          message = (
            <div>
              Your current <strong>Basic</strong> plan will be upgraded to the{' '}
              <strong>{plan.name} monthly</strong> plan today with a new monthly
              price of <strong>${plan.monthlyPrice}</strong>
            </div>
          )
        } else {
          message = (
            <div>
              Your current <strong>Basic</strong> plan will be upgraded to the{' '}
              <strong>{plan.name} annual</strong> plan today with a new annual
              price of <strong>${plan.monthlyPrice * 12}</strong>
            </div>
          )
        }
      } else {
        const currentPlan: Plan = get(plans, id2Plan[currentId])
        if (currentPlan.role === plan.role) {
          if (currentPlan.period === 'monthly') {
            // monthly -> annual
            message = (
              <div>
                Your current <strong>{currentPlan.name} monthly</strong> plan
                will be upgraded to the annual billing of $
                {plan.monthlyPrice * 12} per year today.
              </div>
            )
          } else {
            // annual -> monthly
            message = (
              <div>
                Your current <strong>{currentPlan.name} annual</strong> plan
                will be downgraded to the monthly billing of $
                {plan.monthlyPrice} per month today.
              </div>
            )
          }
        } else {
          if (roleOrders[role] < roleOrders[plan.role]) {
            // upgrade plan
            message = (
              <div>
                Your current <strong>{currentPlan.name}</strong>&nbsp;
                <strong>{currentPlan.period}</strong> plan will be upgraded
                instantly to the <strong>{plan.name}</strong> plan with a new{' '}
                {plan.period} price of{' '}
                <strong>
                  $
                  {plan.period === 'monthly'
                    ? plan.monthlyPrice
                    : plan.monthlyPrice * 12}
                </strong>
                .
              </div>
            )
          } else {
            // downgrade plan
            message = (
              <div>
                Your current <strong>{currentPlan.name}</strong>&nbsp;
                <strong>{currentPlan.period}</strong> plan will be downgraded
                instantly to the <strong>{plan.name}</strong> plan with a new{' '}
                {plan.period} price of{' '}
                <strong>
                  $
                  {plan.period === 'monthly'
                    ? plan.monthlyPrice
                    : plan.monthlyPrice * 12}
                </strong>
                .
              </div>
            )
          }
        }
      }

      const res = await showConfirm({
        title: 'Are you sure?',
        content: message,
        okText: 'Continue'
      })

      if (res === 'OK') {
        if (
          !user.customer ||
          !user.customer.id ||
          !user.customer.sources ||
          !user.customer.sources.data.length
        ) {
          newPlan.current = plan
          setCardMessage(
            <span>
              {`Free for 14 days & $${plan.monthlyPrice}/month (${plan.name} Plan) after.`}
              <br />
              Cancel anytime.
            </span>
          )
          showCardModal(true)
        } else {
          if (user.paymentInfo.subscription) {
            updateSubscription(plan.id)
            logEvent('pricing', 'subscription', 'update', {
              plan,
              old: user.paymentInfo
            })
          } else {
            createSubscription(plan.id)
            logEvent('pricing', 'subscription', 'create', { plan })
          }
        }
      }
    } else {
      router.replace({
        pathname: router.pathname,
        query: { auth: 'signup' }
      })
    }
  }

  async function onCancel() {
    const currentId = get(user.paymentInfo, 'plan')
    if (!currentId) return

    const currentPlan: Plan = get(plans, id2Plan[currentId])
    const periodEnd = get(user.paymentInfo, 'period.end')
    const res = await showConfirm({
      title: 'Are you sure?',
      content: (
        <div>
          Your current
          <strong>
            &nbsp;{currentPlan.name} {currentPlan.period} plan&nbsp;
          </strong>
          will be downgraded to the <strong>Basic plan</strong> on&nbsp;
          {dayjs(periodEnd * 1000).format('MM/DD/YYYY')} with a new price of
          $0.00 per month.
          <br />
          <br />
          Note: You will lose most of the functionality and features when you do
          so.
        </div>
      ),
      okText: 'Continue'
    })
    if (res === 'OK') {
      // deleteSubscription()
      updateSubscription()
    }
  }

  function onSubmit({ token, name }: CardData) {
    showCardModal(false)

    const params = {
      name,
      source: token.id
    }
    if (user.customer && !user.customer.deleted) {
      updateCustomer(params)
    } else {
      createCustomer(params)
    }
  }

  // function onEnterprise() {
  //   // TODO
  // }

  const planInfo = {
    currentRole: get(user.paymentInfo, 'role'),
    currentPlan: get(user.paymentInfo, 'plan'),
    period
  }

  const freeInfo = (
    <PlanInfo plan={plans[period].free} onSelect={onFree} {...planInfo}>
      <p>Includes:</p>
      <ul>
        <li>Property Search</li>
      </ul>
    </PlanInfo>
  )
  const proInfo = (
    <PlanInfo
      plan={plans[period].pro}
      onSelect={() => onSelect(plans[period].pro)}
      onCancel={onCancel}
      {...planInfo}
    >
      <p>Everything in Free plus:</p>
      <ul>
        <li>Market Analytics</li>
        <li>Property Analytics</li>
        <li>CMA+</li>
      </ul>
    </PlanInfo>
  )
  const advancedInfo = (
    <PlanInfo
      plan={plans[period].advanced}
      onSelect={() => onSelect(plans[period].advanced)}
      onCancel={onCancel}
      {...planInfo}
    >
      <p>Everything in Pro plus:</p>
      <ul>
        <li>Expert Analytics</li>
        <li>Value Forecasting</li>
        <li>CMA+ Expert</li>
        <li>CSV Export</li>
      </ul>
    </PlanInfo>
  )
  // const enterpriseInfo = (
  //   <EnterprisePlanInfo onClick={onEnterprise}>
  //     <p>Everything in Advanced plus:</p>
  //     <ul>
  //       <li>Enterpise Support</li>
  //     </ul>
  //   </EnterprisePlanInfo>
  // )

  return (
    <div className='th-pricing'>
      <h1 className='th-page-title'>Pick a Plan</h1>

      <p className='th-page-description'>
        Get instant access to TopHap with your free 14-day trial.
      </p>

      {!user.paymentInfo && (
        <Button className='th-try-free-button' onClick={onFree}>
          Try for Free
          <SvgArrow />
        </Button>
      )}

      <PeriodPicker period={period} onChange={setPeriod} />

      <div className='th-plan-background' />

      <ResizeDetector handleWidth>
        {({ width }: { width: number }) =>
          width > 1080 ? (
            <section>
              <div className='th-plan-headers'>
                <div className='th-headers-description'>Plan Features</div>
                {freeInfo}
                {proInfo}
                {advancedInfo}
                {/*enterpriseInfo*/}
              </div>

              <div className='th-plan-features'>
                <div className='th-recommended-features-block' />
                {features.map(e => (
                  <div key={e.id}>
                    <FeaturesHeader title={e.title} />
                    {e.items.map(feature => (
                      <Feature
                        key={feature.id}
                        title={feature.title}
                        tooltip={feature.tooltip}
                        role={feature.requireRole as TopHap.UserRole}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <Slider
              centerMode
              centerPadding={width > 540 ? '10%' : '20px'}
              className='th-plan-slider'
              dots
              infinite={false}
              initialSlide={1}
              slidesToShow={1}
              slidesToScroll={1}
              speed={500}
            >
              <PlanCard role='free' infoComponent={freeInfo} />
              <PlanCard
                role='pro'
                includingRole='free'
                infoComponent={proInfo}
              />
              <PlanCard
                role='advanced'
                includingRole='pro'
                infoComponent={advancedInfo}
              />
              {/*<PlanCard
                role='enterprise'
                includingRole='advanced'
                infoComponent={enterpriseInfo}
              />*/}
            </Slider>
          )
        }
      </ResizeDetector>

      <FAQ className='th-faq' items={faq} />

      <OverlaySpinner
        visible={
          asyncStatus[Types.CREATE_CUSTOMER] === 'request' ||
          asyncStatus[Types.UPDATE_CUSTOMER] === 'request' ||
          asyncStatus[Types.GET_CUSTOMER] === 'request' ||
          asyncStatus[Types.CREATE_SUBSCRIPTION] === 'request' ||
          asyncStatus[Types.UPDATE_SUBSCRIPTION] === 'request' ||
          asyncStatus[Types.DELETE_SUBSCRIPTION] === 'request'
        }
      />

      <Modal
        visible={cardModal}
        onClose={() => showCardModal(false)}
        className='th-card-input-modal'
      >
        <p>Enter your payment details</p>
        <CardInput message={cardMessage} onSubmit={onSubmit} />
      </Modal>

      <style jsx>{styles}</style>
    </div>
  )
}
