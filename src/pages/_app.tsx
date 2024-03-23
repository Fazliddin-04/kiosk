import { AppProps } from 'next/app'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import '../styles/globals.scss'
import { SWRConfig } from 'swr'
import { persistor, store } from '../store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Layout from '../components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <SWRConfig>
        {typeof window !== 'undefined' ? (
          <PersistGate loading={null} persistor={persistor}>
            <CssVarsProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </CssVarsProvider>
          </PersistGate>
        ) : (
          <CssVarsProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </CssVarsProvider>
        )}
      </SWRConfig>
    </Provider>
  )
}

export default MyApp
