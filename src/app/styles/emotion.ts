// https://emotion.sh/docs/typescript
import { css } from '@emotion/react'

export const notscrollableX = css`
  overflow-x: hidden;
`
export const notscrollable = css`
  ${notscrollableX}
  overflow-y: hidden;
`
export const scrollableX = css`
  overflow-x: auto;
  overflow-y: hidden;
`
export const flexColumn = css`
  display: flex;
  flex-direction: column;
`
export const flexColumnCenter = css`
  ${flexColumn}
  align-items: center;
`
export const flexRow = css`
  display: flex;
  flex-flow: row nowrap;
`
export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const disableTextSelection = css`
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -o-user-select: none;
` // https://stackoverflow.com/a/3779567

// const hideScrollbar = css`
//   // Hide dimensionless scrollbar on MacOS
//   scrollbar-width: none; // Firefox
//   &::-webkit-scrollbar {
//     display: none; // Safari + Chrome
//   }
// `
