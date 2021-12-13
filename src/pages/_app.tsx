import NextApp from 'next/app'
import Head from 'next/head'
import Router from 'next/router'
import withRedux from 'next-redux-wrapper'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@material-ui/core/styles'
import Main from 'containers/Main'
import { facebookAppId, host } from 'configs'
import api from 'configs/api'
import setupStore from 'store/setup'
import { trackPageView } from 'services/analytics'
import theme from 'styles/theme'
import { TopHapAppProps } from 'types/app'

class TopHapApp extends NextApp<TopHapAppProps> {
  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }

    Router.events.on('routeChangeComplete', trackPageView)
  }

  componentWillUnmount() {
    Router.events.off('routeChangeComplete', trackPageView)
  }

  render() {
    const meta = {
      title: 'Real Estate Analysis Platform | TopHap',
      description:
        'TopHap offers the first AI-powered analytics platform to optimize Realtor performance. We uncover valuable real estate insights, giving realtors a comprehensive overview of real estate properties.',
      image: `${host}/images/landing/tophap-neighborhood-insights-640.jpg`,
      url: host + this.props.router.asPath
    }

    return (
      <>
        <Head>
          <title key='title'>{meta.title}</title>
          <meta
            name='description'
            content={meta.description}
            key='description'
          />
          <meta name='robots' content='index, follow' key='robots' />
          <meta name='thumbnail' content={meta.image} key='thumbnail' />
          <meta
            name='viewport'
            content='width=device-width, minimum-scale=1, initial-scale=1, shrink-to-fit=no'
          />

          <meta property='fb:app_id' content={facebookAppId} />
          <meta property='og:title' content={meta.title} key='og:title' />
          <meta
            property='og:description'
            content={meta.description}
            key='og:description'
          />
          <meta property='og:type' content='website' />
          <meta property='og:url' content={meta.url} key='og:url' />
          <meta property='og:image' content={meta.image} key='og:image' />
          <meta property='og:site_name' content='TopHap' />

          <meta name='twitter:creator' content='@tophap_inc' />
          <meta name='twitter:card' content='summary_large_image' />
          <meta
            name='twitter:description'
            content={meta.description}
            key='twitter:description'
          />
          <meta name='twitter:image' content={meta.image} key='twitter:image' />
          <meta name='twitter:site' content='@tophap_inc' />
          <meta name='twitter:title' content={meta.title} key='twitter:title' />

          <link rel='apple-touch-icon' href='/images/icons-512.png' />
          <link rel='canonical' href={meta.url} key='canonical' />
          <link rel='manifest' href='/manifest.json' />
          <link rel='preconnect' href={api.baseUrl} />
          <link rel='shortcut icon' href='/favicon.ico' />
        </Head>
        <ThemeProvider theme={theme}>
          <Provider store={this.props.store}>
            <Main {...this.props} />
          </Provider>
        </ThemeProvider>
      </>
    )
  }
}

export default withRedux(setupStore)(TopHapApp)
