import { IntercomAPI } from 'components/Intercom'
import { logEvent } from 'services/analytics'
import { DropMenu } from '../index'

interface HelpMenuProps {
  eventCategory: string
  isMobile: boolean
  title: React.ReactNode
  onItem?: (e: React.MouseEvent) => void
  showFeedback: TopHap.UICreators['showFeedback']
}

export default function HelpMenu({
  eventCategory,
  isMobile,
  title,
  onItem,
  showFeedback
}: HelpMenuProps) {
  function onFeedback(ev: React.MouseEvent) {
    showFeedback(true)
    if (onItem) onItem(ev)

    logEvent(eventCategory, 'help', 'feedback')
  }

  function onChatWithUs(ev: React.MouseEvent) {
    IntercomAPI('show')
    if (onItem) onItem(ev)

    logEvent(eventCategory, 'help', 'chat_with_us')
  }

  function onVideos(ev: React.MouseEvent) {
    window.open(
      'https://www.youtube.com/channel/UCglZdqeNJxER07DigcKhgzg/',
      '_blank'
    )
    if (onItem) onItem(ev)

    logEvent(eventCategory, 'help', 'videos')
  }

  return (
    <DropMenu
      title={title}
      triggerClassName='th-help-button'
      mode={isMobile ? 'click' : 'hover'}
    >
      <DropMenu.Item onClick={onChatWithUs}>Chat with Us</DropMenu.Item>
      <DropMenu.Item onClick={onFeedback}>Submit Feedback</DropMenu.Item>
      <DropMenu.Item onClick={onVideos}>Training Videos</DropMenu.Item>
    </DropMenu>
  )
}

HelpMenu.defaultProps = {
  title: '?'
}
