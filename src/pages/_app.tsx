import { useEffect, useCallback, useState } from 'react'
import { AppProps } from 'next/app'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import Fallback from 'components/Layout/Fallback'
import '../styles/globals.scss'
import theme from '../mui-theme'
import { SWRConfig } from 'swr'
import { useRouter } from 'next/router'
import setLanguage from 'next-translate/setLanguage'
import { getShipper, getSourceSettings } from 'services'
import { persistor, store } from '../store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  return (
    <Provider store={store}>
      <SWRConfig>
        {typeof window !== 'undefined' ? (
          <PersistGate loading={null} persistor={persistor}>
            <CssVarsProvider>
              <Component {...pageProps} />
            </CssVarsProvider>
          </PersistGate>
        ) : (
          <CssVarsProvider>
            <Component {...pageProps} />
          </CssVarsProvider>
        )}
      </SWRConfig>
    </Provider>
  )
}

export default MyApp
