import React from 'react'
import cn from 'classnames'

import SvgCollapse from 'assets/images/icons/expand_less.svg'
import SvgExpand from 'assets/images/icons/expand_more.svg'

import styles from './styles.scss'

export type FAQItem = {
  question: React.ReactNode
  answer: React.ReactNode
}

type Props = {
  className?: string
  items: FAQItem[]
}

export default function FAQ({ className, items }: Props) {
  const [current, setCurrent] = React.useState(-1)
  return (
    <div className={cn('th-faq', className)}>
      <div className='th-faq-title'>Frequently asked questions</div>
      {items.map((e, index) => (
        <div
          key={index}
          className={cn('th-faq-item', { 'th-expanded': index === current })}
        >
          <div
            className='th-faq-question'
            onClick={() => setCurrent(current === index ? -1 : index)}
          >
            {e.question}
            {current === index ? <SvgCollapse /> : <SvgExpand />}
          </div>
          <div className='th-faq-answer'>{e.answer}</div>
        </div>
      ))}

      <style jsx>{styles}</style>
    </div>
  )
}
