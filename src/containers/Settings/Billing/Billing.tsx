import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'

import Button from 'components/Button'
import CardInput, { CardData } from 'components/CardInput'
import Modal from 'components/Modal'
import OverlaySpinner from 'components/OverlaySpinner'
import Circle from 'components/OverlaySpinner/Spinners/Circle'
import Card from './components/Card'

import SvgDownload from 'assets/images/icons/cloud_download.svg'
import { logEvent } from 'services/analytics'
import { Types } from 'store/actions/user'

import styles from './styles.scss?type=global'

interface BillingProps {
  asyncStatus: TopHap.GlobalState['status']
  user: TopHap.UserState
  addCoupon: TopHap.UserCreators['addCoupon']
  getInvoices: TopHap.UserCreators['getInvoices']
  // deleteSource: TopHap.UserCreators['deleteSource']
  createCustomer: TopHap.UserCreators['createCustomer']
  updateCustomer: TopHap.UserCreators['updateCustomer']
  getUpcomingInvoice: TopHap.UserCreators['getUpcomingInvoice']
  deleteSubscription: TopHap.UserCreators['deleteSubscription']
}

function Coupon({ item }: { item: any }) {
  return <div className='th-current-coupon'>Current: {item.name}</div>
}

function Invoice({ item }: { item: any }) {
  return (
    <div className='th-invoice-item'>
      <span className='th-invoice-status'>{item.status}</span>
      <span className='th-invoice-date'>
        {dayjs(item.date * 1000).format('MM/DD/YYYY')}
      </span>
      <span className='th-invoice-amount'>
        ${(item.amount_due / 100).toFixed(2)}
      </span>
      <span className='th-invoice-download'>
        {item.invoice_pdf ? (
          <a href={item.invoice_pdf}>
            <SvgDownload />
          </a>
        ) : (
          ' '
        )}
      </span>
    </div>
  )
}

export default function Billing({
  asyncStatus,
  user,
  addCoupon,
  getInvoices,
  // deleteSource,
  createCustomer,
  updateCustomer,
  getUpcomingInvoice,
  deleteSubscription
}: BillingProps) {
  const [coupon, setCoupon] = useState('')
  const [cardModal, showCardModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadMore()
  }, [])

  useEffect(() => {
    if (user.paymentInfo && user.paymentInfo.customer) {
      if (user.paymentInfo.subscription && !user.invoices.upcoming.object) {
        getUpcomingInvoice()
      }
    }
  }, [user.paymentInfo && user.paymentInfo.customer])

  function loadMore() {
    if (asyncStatus[Types.GET_INVOICES] === 'request') return

    const { invoices } = user
    if (invoices.hasMore) {
      getInvoices(
        invoices.items.length
          ? invoices.items[invoices.items.length - 1].id
          : undefined
      )
    }
  }

  function onUpgradeMembership() {
    router.push('/pricing')
  }

  function onCancelMembership() {
    deleteSubscription()

    logEvent('billing', 'subscription', 'delete')
  }

  function onAddCoupon() {
    if (asyncStatus[Types.ADD_COUPON] === 'request') return

    if (coupon) {
      addCoupon(coupon)

      logEvent('billing', 'add_coupon')
    }
  }

  function onChangeCard() {
    showCardModal(true)
  }

  // function onRemoveCard() {
  //   if (
  //     user.customer &&
  //     user.customer.sources &&
  //     user.customer.sources.data.length
  //   ) {
  //     deleteSource(user.customer.sources.data[0].id)

  //     logEvent('billing', 'card', 'remove')
  //   }
  // }

  function onSubmit({ token, name }: CardData) {
    showCardModal(false)

    const params = {
      name,
      source: token.id
    }
    if (user.customer && user.customer.id) {
      updateCustomer(params)
      logEvent('billing', 'card', 'update')
    } else {
      createCustomer(params)
      logEvent('billing', 'card', 'add')
    }
  }

  const loadingInvoices = asyncStatus[Types.GET_INVOICES] === 'request'
  const loadingUpcomingInvoice =
    asyncStatus[Types.GET_UPCOMING_INVOICE] === 'request'
  const now = new Date().getTime() / 1000

  return (
    <div className='th-sub-page th-billing'>
      <h2 className='th-sub-page-title'>Billing</h2>

      <section className='th-page-section'>
        <h3 className='th-section-title'>Membership and Plan</h3>
        {user.paymentInfo && user.paymentInfo.role && (
          <>
            <div className='th-block'>
              <h4 className='th-block-title'>Membership</h4>
              <div>
                You are a&nbsp;
                <strong style={{ textTransform: 'capitalize' }}>
                  {user.paymentInfo.role}
                </strong>
                &nbsp;member now.
              </div>
            </div>
            <div className='th-block'>
              <h4 className='th-block-title'>Plan</h4>
              {user.paymentInfo.period && user.paymentInfo.period.end > now ? (
                <div>
                  You&apos;ve subscribed until&nbsp;
                  <strong>
                    {dayjs(user.paymentInfo.period.end * 1000).format(
                      'MM/DD/YYYY'
                    )}
                  </strong>
                  {user.paymentInfo.trial_end ? (
                    <div>
                      You are on <strong>trial</strong> now.
                    </div>
                  ) : null}
                </div>
              ) : (
                <div>You haven&apos;t subscribed yet.</div>
              )}
            </div>

            <div>
              <Button
                className='th-upgrade-button'
                onClick={onUpgradeMembership}
              >
                Upgrade
              </Button>
              {user.paymentInfo.role !== 'free' && (
                <Button
                  className='th-cancel-button'
                  onClick={onCancelMembership}
                >
                  Cancel
                </Button>
              )}
            </div>
          </>
        )}
      </section>

      <section className='th-page-section'>
        <h3 className='th-section-title'>Payment Information</h3>
        <div className='th-block'>
          <h4 className='th-block-title'>Payment Method</h4>
          {user.customer &&
          user.customer.sources &&
          user.customer.sources.data.length ? (
            <Card
              source={user.customer.sources.data[0]}
              loading={
                asyncStatus[Types.DELETE_SOURCE] === 'request' ||
                asyncStatus[Types.UPDATE_CUSTOMER] === 'request'
              }
              onChange={onChangeCard}
              // onRemove={onRemoveCard}
            />
          ) : (
            <>
              <span>No payment method yet.</span>
              <Button className='th-add-method-button' onClick={onChangeCard}>
                Add
              </Button>
            </>
          )}
        </div>
        <div className='th-block'>
          <h4 className='th-block-title'>Coupon</h4>
          <div className='th-block-description'>
            Received a discount from TopHap team? Enter the code below.
          </div>
          <div className='d-flex'>
            <input
              className='th-coupon-input'
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
            />
            <Button className='th-coupon-button' onClick={onAddCoupon}>
              {asyncStatus[Types.ADD_COUPON] === 'request' && (
                <Circle className='mr-2' size={12} />
              )}
              {user.customer && user.customer.discount ? 'Replace' : 'Add'}
            </Button>
          </div>
          {user.customer && user.customer.discount && (
            <Coupon item={user.customer.discount.coupon} />
          )}
          <OverlaySpinner
            absolute
            type='circle'
            size={24}
            visible={asyncStatus[Types.GET_CUSTOMER] === 'request'}
          />
        </div>
      </section>

      <section className='th-page-section'>
        <h3 className='th-section-title'>Invoices</h3>
        <div className='th-block'>
          <h4 className='th-block-title'>Upcoming</h4>
          <div className='th-invoice-item th-invoice-header'>
            <span className='th-invoice-status'>Status</span>
            <span className='th-invoice-date'>Date</span>
            <span className='th-invoice-amount'>Amount</span>
            <span className='th-invoice-download' />
          </div>
          {user.invoices.upcoming.object && (
            <Invoice item={user.invoices.upcoming} />
          )}
          {loadingUpcomingInvoice && (
            <div className='th-invoice-item'>
              <Circle className='th-invoice-loader' size={16} />
            </div>
          )}
        </div>
        <div className='th-block'>
          <h4 className='th-block-title'>Previous</h4>
          <div className='th-invoice-item th-invoice-header'>
            <span className='th-invoice-status'>Status</span>
            <span className='th-invoice-date'>Date</span>
            <span className='th-invoice-amount'>Amount</span>
            <span className='th-invoice-download' />
          </div>
          {user.invoices.items.map(e => (
            <Invoice key={e.id} item={e} />
          ))}
          {loadingInvoices && (
            <div className='th-invoice-item'>
              <Circle className='th-invoice-loader' size={16} />
            </div>
          )}
          {user.invoices.hasMore && (
            <Button className='th-load-more' onClick={loadMore}>
              Load More...
            </Button>
          )}
        </div>
      </section>

      {cardModal && (
        <Modal
          visible={cardModal}
          onClose={() => showCardModal(false)}
          className='th-card-input-modal'
        >
          <p>Enter your payment details</p>
          <CardInput onSubmit={onSubmit} />
        </Modal>
      )}

      <style jsx>{styles}</style>
    </div>
  )
}
