import React from 'react'
import cn from 'classnames'
import Link, { NavLink } from 'components/Link'
import styles from './styles.scss?type=global'

interface DropMenuProps {
  mode: 'hover' | 'click'
  title: React.ReactNode
  triggerClassName?: string
  children?: React.ReactNode
}

interface DropMenuItemProps {
  children?: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
  [ele: string]: any
}

interface DropMenuLinkItemProps extends DropMenuItemProps {
  href: string
}

interface LinkMenuItemProps {
  children: React.ReactNode
  href: string
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

export function DropMenu({
  mode,
  title,
  triggerClassName,
  children
}: DropMenuProps) {
  const [expanded, setExpanded] = React.useState(false)
  const refMenu = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (mode === 'click') {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      if (mode === 'click') {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [mode])

  function handleClickOutside(e: MouseEvent) {
    if (refMenu.current && !refMenu.current.contains(e.target as Node)) {
      setExpanded(false)
    }
  }

  function onClick() {
    if (mode === 'click') {
      setExpanded(!expanded)
    }
  }

  return (
    <div
      className={cn(
        'th-drop-menu',
        { 'th-drop-menu-mobile': mode === 'click' },
        { 'th-expanded': expanded }
      )}
    >
      <div
        className={cn('th-menu-item', triggerClassName)}
        onClick={onClick}
        ref={refMenu}
      >
        {title}
      </div>
      <ul className='th-drop-menu-content'>{children}</ul>

      <style jsx>{styles}</style>
    </div>
  )
}

DropMenu.defaultProps = {
  mode: 'hover'
}

DropMenu.Item = ({ onClick, children, ...props }: DropMenuItemProps) => {
  return (
    <li className='th-drop-menu-item' {...props} onClick={onClick}>
      {children}
      <style jsx>{styles}</style>
    </li>
  )
}

DropMenu.LinkItem = function({ onClick, ...props }: DropMenuLinkItemProps) {
  return (
    <NavLink
      className='th-drop-menu-item'
      activeClassName='th-active'
      onClick={onClick}
      {...props}
    />
  )
}

export function LinkMenuItem({ children, onClick, href }: LinkMenuItemProps) {
  // TODO: check if it is active
  return (
    <>
      <Link href={href} className='th-menu-item' onClick={onClick}>
        {children}
      </Link>
      <style jsx>{styles}</style>
    </>
  )
}
