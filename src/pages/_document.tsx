// ※1 https://github.com/mui-org/material-ui/blob/master/examples/nextjs-with-typescript/pages/_document.tsx
// https://github.com/mui-org/material-ui/blob/next/examples/nextjs-with-typescript/pages/_document.tsx
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import { ServerStyleSheets } from '@material-ui/styles'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import React from 'react'
import theme from 'src/app/styles/theme'

function getCache() {
  const cache = createCache({ key: 'css', prepend: true })
  cache.compat = true
  return cache
}

/*
    https://nextjs.org/docs/advanced-features/custom-document
    カスタムドキュメントは通常、アプリケーションの<html>タグと<body>タグを補強するために使用されます。
*/
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        {/* <Head>は必須 */}
        <Head>
          {/* PWA primary color */}
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          {/* https://fonts.google.com/specimen/Sawarabi+Mincho?subset=japanese&selection.family=Sawarabi+Mincho */}
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Sawarabi+Mincho&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const sheets = new ServerStyleSheets() // ※1 CSS の名前変更エラーを回避するためにまだ必要（不要になるのはv5への完全な以降後か）
  const originalRenderPage = ctx.renderPage

  const cache = getCache()
  const { extractCriticalToChunks } = createEmotionServer(cache)

  ctx.renderPage = () =>
    originalRenderPage({
      // Take precedence over the CacheProvider in our custom _app.js
      enhanceComponent: (Component) => (props) =>
        (
          <CacheProvider value={cache}>
            <Component {...props} />
          </CacheProvider>
        ),
      enhanceApp: (App) => (props) => sheets.collect(<App {...props} />), // ※1
    })

  const initialProps = await Document.getInitialProps(ctx)
  const emotionStyles = extractCriticalToChunks(initialProps.html)
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ))

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [...React.Children.toArray(initialProps.styles), ...emotionStyleTags],
  }
}

// // `getInitialProps` belongs to `_document` (instead of `_app`),
// // it's compatible with server-side generation (SSG).
// MyDocument.getInitialProps = async (ctx) => {
//   // Resolution order
//   //
//   // On the server:
//   // 1. app.getInitialProps
//   // 2. page.getInitialProps
//   // 3. document.getInitialProps
//   // 4. app.render
//   // 5. page.render
//   // 6. document.render
//   //
//   // On the server with error:
//   // 1. document.getInitialProps
//   // 2. app.render
//   // 3. page.render
//   // 4. document.render
//   //
//   // On the client
//   // 1. app.getInitialProps
//   // 2. page.getInitialProps
//   // 3. app.render
//   // 4. page.render

//   // Render app and page and get the context of the page with collected side effects.
//   const sheets = new ServerStyleSheets()
//   const originalRenderPage = ctx.renderPage

//   ctx.renderPage = () =>
//     originalRenderPage({
//       enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
//     })

//   const initialProps = await Document.getInitialProps(ctx)

//   return {
//     ...initialProps,
//     // Styles fragment is rendered after the app and page rendering finish.
//     styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
//   }
// }
