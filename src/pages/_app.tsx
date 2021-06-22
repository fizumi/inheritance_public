// import createCache from '@emotion/cache'
// import { CacheProvider } from '@emotion/react' // ※1
import CssBaseline from '@material-ui/core/CssBaseline' // https://next.material-ui.com/components/css-baseline/
import { AppProps } from 'next/app'
import Head from 'next/head'
import React from 'react'
import AppBar from 'src/app/components/AppBar'
import AppSettingsDrawer from 'src/app/components/AppSettingsDrawer'
import { ObservedDummyComponent } from 'src/app/hooks'
import AppProvider from 'src/app/Provider'
import { setMyDebugMethodToConsole } from 'src/utils/common/debug'
import 'tippy.js/dist/tippy.css'
// import 'src/app/styles/reseter.css'
import 'src/app/styles/destyle.css'
setMyDebugMethodToConsole()

// const cache = createCache({ key: 'css', prepend: true }) // ※1
// cache.compat = true // ※1

const App: React.FC<AppProps> = (props) => {
  const { Component, pageProps } = props

  // ↓ これはまだ必要
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])

  return (
    // <CacheProvider value={cache}>
    <>
      <Head>
        <title>default title</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <AppProvider>
        <CssBaseline />
        <ObservedDummyComponent />
        <AppSettingsDrawer />
        <AppBar />
        <Component {...pageProps} />
      </AppProvider>
    </>
  )
}
export default App

// ※1 https://github.com/mui-org/material-ui/blob/2d4d0663ff1ed732e6952705d0e23eda13ae25ea/examples/nextjs-with-typescript/pages/_app.tsx
