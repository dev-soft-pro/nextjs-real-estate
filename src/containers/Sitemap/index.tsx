import React from 'react'
import { NextPageContext } from 'next'
import capitalize from 'capitalize'
import Breadcrumb from 'components/Breadcrumb'
import GeoAutocomplete from 'components/GeoAutocomplete/advanced'
import Link from 'components/Link'
import { getLinks } from 'services/sitemap'

import SvgLogo from 'assets/images/logos/app-icon.svg'
import styles from './styles.scss?type=global'

const listFileName = ['counties', 'cities', 'streets', 'addresses']

interface SitemapProps {
  components: string[]
  sitemap: {
    url: string
    title?: string
    items: {
      url: string
      title: string
    }[]
  }
}

export default function Sitemap({ components, sitemap }: SitemapProps) {
  const [keyword, setKeyword] = React.useState<string>('')
  const [suggestion, setSuggestion] = React.useState<TopHap.Place>()

  function onChangePlace(event: any, { newValue }: any) {
    setKeyword(newValue)
    if (!newValue) {
      setSuggestion(undefined)
    }
  }

  function onSuggestions(suggestions: TopHap.Place[]) {
    if (suggestions.length) {
      setSuggestion(suggestions[0])
    }
  }

  function onSuggestionSelected(suggestion: TopHap.Place) {
    onSearch(suggestion)
  }

  function onClear() {
    setKeyword('')
    setSuggestion(undefined)
  }

  function onSearch(suggestion?: TopHap.Place) {
    if (suggestion) {
      // TODO hash url
      // const state = {
      //   k: suggestion.place_name,
      //   l: true,
      //   rv: true
      // }
      // history.push(`/homes#/list/${btoa(JSON.stringify(state))}`)
    }
  }

  return (
    <div className='th-sitemap container'>
      <Breadcrumb className='mt-4'>
        <Breadcrumb.Item>
          <SvgLogo className='th-icon' />
          <Link href='/'>USA</Link>
        </Breadcrumb.Item>
        {components.map((e, index) => (
          <Breadcrumb.Item key={e + index}>
            <Link
              href='/sitemap/html/[...path]'
              as={`/sitemap/html/${components.slice(0, index + 1).join('/')}/${
                listFileName[index]
              }.html`}
            >
              {index ? capitalize.words(e.replace('-', ' ')) : e.toUpperCase()}
            </Link>
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
      <h1 className='th-title'>{sitemap.title}</h1>

      <GeoAutocomplete
        placeholder={'Address, Neighborhood, City'}
        value={keyword}
        onChange={onChangePlace}
        onClear={onClear}
        onSearch={() => onSearch(suggestion)}
        onSuggestionSelected={onSuggestionSelected}
        onSuggestions={onSuggestions}
      />

      <div className='th-links'>
        <ul>
          {sitemap.items.map(e => (
            <li key={e.url}>
              {e.url.startsWith('/homes/details') ? (
                <Link href='/homes/details/[address]/[id]' as={e.url}>
                  {e.title}
                </Link>
              ) : (
                <Link href='/sitemap/html/[...path]' as={e.url}>
                  {e.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}

Sitemap.getInitialProps = async ({ query, asPath }: NextPageContext) => {
  const sitemap = await getLinks(asPath as string)
  return { components: query.path.slice(0, -1), sitemap }
}
