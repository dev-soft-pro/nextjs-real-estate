import React from 'react'
import Scroll from 'react-scroll'
import delay from 'lodash/delay'
import Tabs from 'components/Tabs'
import styles from './styles.scss?type=global'

export default function NavBar({ containerId }: { containerId?: string }) {
  const [item, setItem] = React.useState<string | undefined>('description')
  React.useEffect(() => {
    Scroll.Events.scrollEvent.register('begin', () => {
      document.body.classList.toggle('th-disable-header-down', true)
    })

    Scroll.Events.scrollEvent.register('end', () => {
      delay(() => {
        document.body.classList.toggle('th-disable-header-down', false)
      }, 100)
    })

    return () => {
      Scroll.Events.scrollEvent.remove('begin')
      Scroll.Events.scrollEvent.remove('end')
    }
  }, [])

  const navOffset = containerId ? -200 : -250

  function handleSetActive(to: string) {
    setItem(to)
  }

  function _renderItem(label: string, to: string) {
    return (
      <Tabs.Tab
        label={
          <Scroll.Link
            activeClass='th-active'
            className='th-nav-item'
            to={to}
            containerId={containerId}
            duration={300}
            ignoreCancelEvents
            isDynamic
            offset={navOffset}
            smooth={'linear'}
            spy
            onSetActive={handleSetActive}
          >
            {label}
          </Scroll.Link>
        }
        value={to}
      />
    )
  }

  return (
    <div className='th-navs-bar'>
      <Tabs value={item}>
        {_renderItem('Description', 'description')}
        {_renderItem('Overview', 'overview')}
        {_renderItem('Relevant Properties', 'relevant_properties')}
        {_renderItem(
          'Nearby Property Statistics',
          'nearby_property_statistics'
        )}
        {_renderItem('Public Records', 'public_records')}
        {_renderItem('Property History', 'property_history')}
      </Tabs>

      <style jsx>{styles}</style>
    </div>
  )
}

// export default React.memo(NavBar)
