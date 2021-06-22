import { css } from '@emotion/react'
import { useTheme } from '@material-ui/core'
import Button from '@material-ui/core/Button' // https://next.material-ui.com/components/buttons/#contained-buttons
import { blueGrey } from '@material-ui/core/colors'
import Head from 'next/head'
import Link from 'next/link' // https://nextjs.org/learn/basics/navigate-between-pages/link-component
import { flexColumnCenter } from 'src/app/styles/emotion'
import { fontFamily } from 'src/app/styles/static'
import Title from 'src/features/LP/components/Title'
import { useDetectScrollbarPresenceWhenWindowResize } from 'src/utils/react/hooks/useDetectScrollbarPresence'

export const Home = (): JSX.Element => {
  const theme = useTheme()
  const { vertical: existsVerticalScrollbar } = useDetectScrollbarPresenceWhenWindowResize()

  return (
    <div
      css={css`
        ${flexColumnCenter}
        justify-content: flex-start;
        align-items: center;

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }
      `}
    >
      <Head>
        <title>相続自動計算</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        css={css`
          padding: 5rem 0;
          flex: 1;
          ${flexColumnCenter}
          justify-content: flex-start;
          align-items: center;
          font-family: ${fontFamily};
        `}
      >
        <Title />

        <p
          css={(theme) => css`
            font-size: 1.1rem;
            margin-top: 4em;
            color: ${theme.palette.grey[600]};
            text-align: center;
          `}
        >
          もう、一つひとつの法定相続分を地道に計算する必要はありません。
          <br />
          お手元の戸籍データを入力後、１クリックで、法定相続持分の計算が完了します。
        </p>

        <Link href="/inheritance">
          <Button
            variant="contained"
            css={css`
              margin-top: 5em;
            `}
          >
            使ってみる
          </Button>
        </Link>
      </main>

      <footer
        css={[
          css`
            background-color: ${theme.palette.primary.dark};
            width: 100%;
            height: 2em;
            border-top: 1px solid #eaeaea;
            display: flex;
            justify-content: center;
            align-items: center;
            display: flex;
            justify-content: center;
            align-items: center;
          `,
          existsVerticalScrollbar
            ? null
            : css`
                position: fixed;
                left: 0;
                bottom: 0;
              `,
        ]}
      >
        <small
          css={css`
            color: ${blueGrey[300]};
          `}
        >
          Copyright © 2021 深澤 泉 All Rights Reserved.
        </small>
      </footer>
    </div>
  )
}

export default Home
