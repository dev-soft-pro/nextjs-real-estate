import { AppProps } from 'next/app'
import { Store } from 'redux'
import { NextPageContext } from 'next'

export interface TopHapAppProps extends AppProps {
  store: Store
}

export interface PageContext extends NextPageContext {
  store: Store
}
