// https://emotion.sh/docs/keyframes
import React from 'react'
import { css, keyframes, Global, SerializedStyles } from '@emotion/react'
import { randomRange } from 'fp-ts/Random'
import { notscrollableX } from 'src/app/styles/emotion'
import { fontFamily } from 'src/app/styles/static'
import { staticTheme } from 'src/app/styles/theme'
import useRenderOnClient from 'src/utils/react/hooks/useRenderOnClient'
import useUnmount from 'src/utils/react/hooks/useUnmount'

// const getRndInteger = (min, max) =>
//   Math.floor(Math.random() * (max - min)) + min
const randomRadian = randomRange(0, 2 * Math.PI)

const randomXY = () => {
  const radian = randomRadian()
  return [Math.cos(radian), Math.sin(radian)] as [number, number]
}

const fadeInFromRandomDegree = (x: number, y: number) => keyframes`
  from {
    text-shadow: 0px 0px 100px black; // https://www.yoheim.net/blog.php?q=20121103 // ぼかした文字
    top: calc(1em * ${y});
    left: calc(1em * ${x});
  }

  50% {
    text-shadow: 0px 0px 10px black;
  }

  to {
    top: 0;
    left: 0;
    text-shadow: 0px 0px 0px black;
  }
`

const zoomIn = keyframes`
  from {
    text-shadow: 0px 0px 100px ${staticTheme.palette.primary.main};
  }

  50% {
    text-shadow: 0px 0px 10px ${staticTheme.palette.primary.main};
  }

  to {
    text-shadow: 0px 0px 0px ${staticTheme.palette.primary.main};
  }

`

const invisibleStyle = css`
  visibility: hidden;
`
const invisible = (txt: string) => <span css={invisibleStyle}>{txt}</span>
const applyAnimation =
  (txt: string) => (char: string, css?: SerializedStyles | SerializedStyles[]) => {
    const [forth, back] = txt.split(char)
    return (
      <>
        {invisible(forth)}
        <span css={css}>{char}</span>
        {invisible(back)}
      </>
    )
  }
const txts = [`大量の相続計算を`, `一瞬`, `で`]
const txt = txts.join('')
const xyArray = (txts[0] + txts[2]).split('').map(randomXY)
const apply = applyAnimation(txt)

export default function Title({ xys = xyArray }: { xys?: [number, number][] }): React.ReactElement {
  const renderOnClient = useRenderOnClient() // ランダムな値を利用するため server と client とで class name の不整合が発生する
  const willUnmountShortly = useUnmount(3000)
  return (
    <div
      css={css`
        position: relative;
      `}
    >
      {willUnmountShortly(
        <Global
          styles={css`
            html {
              ${notscrollableX}
            }
          `}
        />
      )}
      <h1 css={title}>{invisible(txt)}</h1>
      {renderOnClient(
        <>
          {txts[0].split('').map((char, i) => {
            return (
              <h1 key={i} css={overlapedTitle}>
                {apply(char, anime(fadeInFromRandomDegree(...xys[i]), i ? '0.' + i : ''))}
              </h1>
            )
          })}
          <h1 css={overlapedTitle}>{apply(txts[1], anime(zoomIn, 1))}</h1>
          <h1 css={overlapedTitle}>
            {apply(txts[2], anime(fadeInFromRandomDegree(...xys[xys.length - 1]), 0.8))}
          </h1>
        </>
      )}
    </div>
  )
}

const anime = (keyframes: SerializedStyles, delay?: string | number) => css`
  animation: ${keyframes} 1s ease;
  animation-fill-mode: forwards;
  animation-delay: ${delay ? delay + 's' : '0'};
  position: relative;
`

const title = css`
  margin-top: 3rem;
  text-align: center;
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
  font-family: ${fontFamily};
`
const overlap = css`
  position: absolute;
  top: 0;
`
const overlapedTitle = css`
  ${title}
  ${overlap}
  white-space: nowrap;
  color: rgb(0 0 0 / 0%); // 透明 / animation で透明を解除する
`
