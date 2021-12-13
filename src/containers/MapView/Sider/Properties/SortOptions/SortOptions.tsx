import React from 'react'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import SortIcon from '@material-ui/icons/Sort'
import UpIcon from '@material-ui/icons/ArrowUpward'
import DownIcon from '@material-ui/icons/ArrowDownward'
import cn from 'classnames'

import { sortOptions } from 'consts/data_mapping'
import Popover from 'components/Popover'
import Button from 'components/Button'
import { logEvent } from 'services/analytics'
import styles from './styles.scss?type=global'

interface SortOptionsProps {
  sort: TopHap.Sort
  setOption: TopHap.PreferencesCreators['setOption']
}

function SortOptions({ sort, setOption }: SortOptionsProps) {
  const [expanded, setExpanded] = React.useState(false)
  const refElement = React.useRef<HTMLDivElement>(null)

  function toggle() {
    setExpanded(!expanded)
  }

  function collapse(event: any) {
    const appElement = document.querySelector('.th-app') as Element

    if (
      (refElement.current && refElement.current.contains(event.target)) ||
      !appElement.contains(event.target)
    ) {
      return
    }

    setExpanded(false)
  }

  function changeDirection(dir: 'asc' | 'desc') {
    setOption('sort.dir', dir)

    logEvent('map', 'sort', 'dir', { dir, option: sort.option })
  }

  function changeOption(option: TopHap.PropertySortKey) {
    setOption('sort.option', option)

    logEvent('map', 'sort', 'option', { dir: sort.dir, option })
  }

  return (
    <div
      className={cn('th-sort-option', { 'th-expanded': expanded })}
      ref={refElement}
    >
      <div className='th-trigger' onClick={toggle}>
        <SortIcon
          className={cn('th-icon', {
            'th-flipped': sort.dir === 'asc'
          })}
        />
        <div className='th-title'>
          Sort by {sortOptions.filter(e => e.value === sort.option)[0].name}
        </div>
        <ExpandMoreIcon
          className={cn('th-icon', 'th-expand-icon', {
            'th-rotated': expanded
          })}
        />
      </div>

      <Popover expanded={expanded} onClickOutside={collapse} anchor='top right'>
        <div className='th-directions'>
          <Button
            className={cn('th-dir-button', {
              'th-selected': sort.dir === 'asc'
            })}
            onClick={() => changeDirection('asc')}
          >
            <DownIcon className='th-icon' />
            A-Z
          </Button>
          <Button
            className={cn('th-dir-button', {
              'th-selected': sort.dir === 'desc'
            })}
            onClick={() => changeDirection('desc')}
          >
            <UpIcon className='th-icon' />
            Z-A
          </Button>
        </div>
        <div className='th-options'>
          {sortOptions.map(e => (
            <Button
              key={e.name}
              className={cn('th-option-button', {
                'th-selected': e.value === sort.option
              })}
              onClick={() => changeOption(e.value)}
            >
              {e.name}
            </Button>
          ))}
        </div>
      </Popover>

      <style jsx>{styles}</style>
    </div>
  )
}

export default React.memo(SortOptions)
