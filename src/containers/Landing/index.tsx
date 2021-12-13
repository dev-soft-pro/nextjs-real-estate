import React, { useState } from 'react'
import NextLink from 'next/link'
import cn from 'classnames'
import 'lazysizes'

import Button from 'components/Button'
import IntroVideo from 'components/IntroVideo'
import Link from 'components/Link'
import CookieConsent from 'components/CookieConsent'
import SvgArrow from 'assets/images/landing/arrow.svg'
import SvgWaves from 'assets/images/landing/waves.svg'
import SvgGraph from 'assets/images/landing/graph.svg'

import { logEvent } from 'services/analytics'

import styles from './styles.scss?type=global'
import sitemapLinks from './_sitemap'

const imgBaseUrl = '/images/landing'
const mapPage = '/map'
const companies = ['berkshire', 'compass', 'sothebys', 'exp', 'kw']

export default function Landing() {
  const [allLinks, showAllLinks] = useState(false)

  function toggleAllLinks() {
    showAllLinks(!allLinks)
  }

  return (
    <div className='th-landing'>
      <div className='th-header-back' />

      <section className='th-section th-hero-section'>
        <div className='th-section-content'>
          <img
            className='lazyload th-section-background'
            srcSet={`${imgBaseUrl}/tophap-map-750.jpg 750w, ${imgBaseUrl}/tophap-map-1080.jpg 1080w, ${imgBaseUrl}/tophap-map-1440.jpg 1440w, ${imgBaseUrl}/tophap-map-1920.jpg 1920w, ${imgBaseUrl}/tophap-map.jpg 2792w`}
            src={`${imgBaseUrl}/tophap-map.jpg`}
            alt='TopHap Real Estate'
          />

          <div className='th-section-texts'>
            <h1 className='th-title'>
              Real Estate <strong>Research</strong> Starts Here
            </h1>
            <NextLink href={mapPage}>
              <span>
                <Button
                  className='th-explore-button'
                  onClick={() => logEvent('landing', 'click', 'hero_section')}
                >
                  Try for Free
                  <SvgArrow className='th-arrow-icon' />
                </Button>
              </span>
            </NextLink>
          </div>
        </div>

        <div className='th-intro-video-container'>
          <IntroVideo />
        </div>
      </section>

      <section className='th-section th-info-section th-neighborhood-section'>
        <div className='th-section-content'>
          <Link
            href={mapPage}
            onClick={() =>
              logEvent('landing', 'click', 'neighborhood_insights_section')
            }
          >
            <img
              className='lazyload th-section-img'
              alt='Tophap Neighborhood Insights'
              data-sizes='(max-width: 960px) 320px, (max-width: 1440px) 420px, 670px'
              data-src={`${imgBaseUrl}/tophap-neighborhood-insights-1340.jpg`}
              data-srcset={`${imgBaseUrl}/tophap-neighborhood-insights-640.jpg 640w, ${imgBaseUrl}/tophap-neighborhood-insights-840.jpg 840w, ${imgBaseUrl}/tophap-neighborhood-insights-1340.jpg 1340w`}
            />
          </Link>
          <div className='th-section-texts'>
            <h3 className='th-section-title'>
              <strong>Know</strong>
              <br />
              Your Market
            </h3>
            <p className='th-section-description'>
              Master your market by uncovering micro-neighborhood trends and
              insights down to the street level.
            </p>
            <Link
              className='th-explore-link'
              href={mapPage}
              onClick={() =>
                logEvent('landing', 'click', 'neighborhood_insights_section')
              }
            >
              Try Now
              <SvgArrow className='th-arrow-icon' />
            </Link>
          </div>
        </div>
      </section>

      <section className='th-section th-info-section th-analytics-section'>
        <div className='th-section-content'>
          <div className='th-section-texts'>
            <h3 className='th-section-title'>
              <strong>Expand</strong>
              <br />
              Your Territory
            </h3>
            <p className='th-section-description'>
              Gain confidence outside of your home territory. Easily analyze
              real estate markets across California.
            </p>
            <Link
              className='th-explore-link'
              href={mapPage}
              onClick={() => logEvent('landing', 'click', 'discover_section')}
            >
              Try Now
              <SvgArrow className='th-arrow-icon' />
            </Link>
          </div>
          <Link
            href={mapPage}
            onClick={() => logEvent('landing', 'click', 'discover_section')}
          >
            <img
              className='lazyload th-section-img'
              alt='Tophap Statewide Analytics'
              data-sizes='(max-width: 960px) 320px, (max-width: 1440px) 420px, 670px'
              data-src={`${imgBaseUrl}/tophap-statewide-analytics-1340.jpg`}
              data-srcset={`${imgBaseUrl}/tophap-statewide-analytics-640.jpg 640w, ${imgBaseUrl}/tophap-statewide-analytics-840.jpg 840w, ${imgBaseUrl}/tophap-statewide-analytics-1340.jpg 1340w`}
            />
          </Link>
        </div>
      </section>

      <section className='th-section th-info-section th-listings-section'>
        <div className='th-section-content'>
          <Link
            href={mapPage}
            onClick={() => logEvent('landing', 'click', 'properties_section')}
          >
            <img
              className='lazyload th-section-img'
              alt='Tophap Properties'
              data-sizes='(max-width: 960px) 320px, (max-width: 1440px) 420px, 670px'
              data-src={`${imgBaseUrl}/tophap-listings-1340.jpg`}
              data-srcset={`${imgBaseUrl}/tophap-listings-640.jpg 640w, ${imgBaseUrl}/tophap-listings-840.jpg 840w, ${imgBaseUrl}/tophap-listings-1340.jpg 1340w`}
            />
          </Link>
          <div className='th-section-texts'>
            <h3 className='th-section-title'>
              <strong>Search</strong>
              <br />
              Properties, Statewide
            </h3>
            <p className='th-section-description'>
              Quickly search all for sale, pending and sold properties across
              the entire state of California
            </p>
            <Link
              className='th-explore-link'
              href={mapPage}
              onClick={() => logEvent('landing', 'click', 'properties_section')}
            >
              Try Now
              <SvgArrow className='th-arrow-icon' />
            </Link>
          </div>
        </div>
      </section>

      <section className='th-section th-info-section th-property-section'>
        <div className='th-section-content'>
          <div className='th-section-texts'>
            <h3 className='th-section-title'>
              <strong>Analyze</strong>
              <br />
              Property Insights
            </h3>
            <p className='th-section-description'>
              Gather everything you need to know about a property to give the
              best client advice.
            </p>
            <Link
              className='th-explore-link'
              href={mapPage}
              onClick={() => logEvent('landing', 'click', 'property_section')}
            >
              Try Now
              <SvgArrow className='th-arrow-icon' />
            </Link>
          </div>
          <Link
            href={mapPage}
            onClick={() => logEvent('landing', 'click', 'property_section')}
          >
            <img
              className='lazyload th-section-img'
              alt='Tophap Property Insights'
              data-sizes='(max-width: 960px) 320px, (max-width: 1440px) 420px, 670px'
              data-src={`${imgBaseUrl}/tophap-property-insights-1340.jpg`}
              data-srcset={`${imgBaseUrl}/tophap-property-insights-640.jpg 640w, ${imgBaseUrl}/tophap-property-insights-840.jpg 840w, ${imgBaseUrl}/tophap-property-insights-1340.jpg 1340w`}
            />
          </Link>
        </div>
      </section>

      <section className='th-section th-info-section th-permits-section'>
        <div className='th-section-content'>
          <Link
            href={mapPage}
            onClick={() => logEvent('landing', 'click', 'permits_section')}
          >
            <img
              className='lazyload th-section-img'
              alt='Tophap Permits History'
              data-sizes='(max-width: 960px) 320px, (max-width: 1440px) 420px, 670px'
              data-src={`${imgBaseUrl}/tophap-permits-1340.jpg`}
              data-srcset={`${imgBaseUrl}/tophap-permits-640.jpg 640w, ${imgBaseUrl}/tophap-permits-840.jpg 840w, ${imgBaseUrl}/tophap-permits-1340.jpg 1340w`}
            />
          </Link>
          <div className='th-section-texts'>
            <h3 className='th-section-title'>
              <strong>Review</strong>
              <br />
              Full Building Permit History
            </h3>
            <p className='th-section-description'>
              Review full property permit history and analyze full residential
              building permit activity across the state.
            </p>
            <Link
              className='th-explore-link'
              href={mapPage}
              onClick={() => logEvent('landing', 'click', 'permits_section')}
            >
              Try Now
              <SvgArrow className='th-arrow-icon' />
            </Link>
          </div>
        </div>
      </section>

      <section className='th-section th-info-section th-calculator-section'>
        <SvgGraph className='th-section-background' />
        <div className='th-section-content'>
          <div className='th-section-texts'>
            <h3 className='th-section-title'>
              <strong>Calculate</strong>
              <br />
              Improvement Value
            </h3>
            <p className='th-section-description'>
              Reveal the full property improvement potential by adjusting the
              square footage, room count and property condition.
            </p>
            <Link
              className='th-explore-link'
              href={mapPage}
              onClick={() => logEvent('landing', 'click', 'calculator_section')}
            >
              Try Now
              <SvgArrow className='th-arrow-icon' />
            </Link>
          </div>
          <Link
            href={mapPage}
            onClick={() => logEvent('landing', 'click', 'calculator_section')}
          >
            <img
              className='lazyload th-section-img'
              alt='Tophap Estimate Calculator'
              data-src={`${imgBaseUrl}/tophap-estimate-calculator.svg`}
            />
          </Link>
        </div>
      </section>

      <section className='th-section th-info-section th-3d-lot-section'>
        <div className='th-section-content'>
          <Link
            href={mapPage}
            onClick={() => logEvent('landing', 'click', '3d_lot_section')}
          >
            <img
              className='lazyload th-section-img'
              alt='Tophap 3d Lot Topography'
              data-sizes='(max-width: 960px) 320px, (max-width: 1440px) 420px, 670px'
              data-src={`${imgBaseUrl}/tophap-3d-lot-topography-1340.jpg`}
              data-srcset={`${imgBaseUrl}/tophap-3d-lot-topography-640.jpg 640w, ${imgBaseUrl}/tophap-3d-lot-topography-840.jpg 840w, ${imgBaseUrl}/tophap-3d-lot-topography-1340.jpg 1340w`}
            />
          </Link>
          <div className='th-section-texts'>
            <SvgWaves className='th-elevation-icon' />
            <h3 className='th-section-title'>
              <strong>Discover</strong>
              <br />
              3D Lot Topography
            </h3>
            <p className='th-section-description'>
              Examine lot usability and elevation without the need to visit the
              site.
            </p>
            <Link
              className='th-explore-link'
              href={mapPage}
              onClick={() => logEvent('landing', 'click', '3d_lot_section')}
            >
              Try Now
              <SvgArrow className='th-arrow-icon' />
            </Link>
          </div>
        </div>
      </section>

      <section className='th-section th-company-section'>
        <div className='th-section-content'>
          <div className='th-company-logos'>
            {companies.map(company => (
              <div className='th-company' key={company}>
                <img
                  key={company}
                  alt={company}
                  src={`${imgBaseUrl}/logos/${company}.png`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='th-section th-info-section th-testimonial-section'>
        <div className='th-section-content'>
          <div className='th-testimonial-text'>
            <p>
              When a user browses TopHap’s tools, they’ll quickly understand how
              even a single street is ultimately its own micro market, pulling
              the curtain back on everything that makes real estate worth what
              it’s worth. My take is that there is no better way to understand a
              market than by understanding how it relates to the markets around
              it.
            </p>
            <p>
              After all, markets touch, and like the properties of thermal
              conduction, values spread through direct contact, and TopHap puts
              you in the middle of all that market energy.
            </p>
          </div>
          <a
            className='th-author'
            href='https://www.inman.com/author/craig-rowe/'
            target='_blank'
            rel='noopener noreferrer'
          >
            - Craig Rowe
          </a>
          <a
            className='th-logo'
            href='https://www.inman.com/2019/11/08/map-based-data-service-tophap-helps-agents-master-their-market/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <img alt='inman' src={`${imgBaseUrl}/logos/inman-logo.png`} />
          </a>
        </div>
      </section>

      <section className='th-section th-sitemap-section'>
        <div className='th-section-content container'>
          <h3 className='th-section-title'>
            Browse Properties by County
            <Link
              href='/sitemap/html/[...path]'
              as='/sitemap/html/ca/counties.html'
            >
              View full list
            </Link>
          </h3>
          <div className='th-links'>
            <ul className={cn({ 'th-show-less': !allLinks })}>
              {sitemapLinks.map(e => (
                <li key={e.href}>
                  <Link href='/sitemap/html/[...path]' as={e.href}>
                    {e.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className='th-show-links' onClick={toggleAllLinks}>
              {allLinks ? 'Show Less' : 'Show More'}
            </div>
          </div>
        </div>
      </section>
      <CookieConsent />
      <style jsx>{styles}</style>
    </div>
  )
}
