import { DropMenu } from '../index'
import { logEvent } from 'services/analytics'

interface AccountMenuProps {
  eventCategory: string
  isMobile: boolean
  title: React.ReactNode
  userProvider: string
  signOut: TopHap.UserCreators['signOut']
}

export default function AccountMenu({
  eventCategory,
  isMobile,
  title,
  userProvider,
  signOut
}: AccountMenuProps) {
  function onAccount() {
    logEvent(eventCategory, 'account', 'profile')
  }

  function onBilling() {
    logEvent(eventCategory, 'account', 'billing')
  }

  function onSignOut() {
    logEvent(eventCategory, 'account', 'sign_out')

    signOut()
  }

  return (
    <DropMenu
      title={title}
      triggerClassName='th-avatar-wrapper'
      mode={isMobile ? 'click' : 'hover'}
    >
      <DropMenu.LinkItem href='/settings/profile' onClick={onAccount}>
        Account
      </DropMenu.LinkItem>
      {userProvider === 'password' && (
        <DropMenu.LinkItem
          href='/settings/change_password'
          label='Change Password'
        >
          Change Password
        </DropMenu.LinkItem>
      )}
      <DropMenu.LinkItem href='/settings/billing' onClick={onBilling}>
        Billing
      </DropMenu.LinkItem>
      <hr />
      <DropMenu.Item onClick={onSignOut} label='Sign Out'>
        Sign Out
      </DropMenu.Item>

      <style jsx global>
        {`
          .th-avatar-wrapper {
            border-radius: 50%;
            margin: 0;
            padding: 0;
          }
        `}
      </style>
    </DropMenu>
  )
}
