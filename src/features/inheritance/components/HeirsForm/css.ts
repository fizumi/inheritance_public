/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Theme } from '@material-ui/core/styles'
import { css } from '@emotion/react'

// https://dev.to/xtrp/how-to-create-a-beautiful-custom-scrollbar-for-your-site-in-plain-css-1mjg
// https://next.material-ui.com/customization/palette/#dark-mode
export const scrollbar = (theme: Theme) => css`
  scrollbar-width: none; // 一旦、Firefox では非表示

  &::-webkit-scrollbar {
    width: 20px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${theme.palette.grey[300]};
    border-radius: 20px;
    border: 6px solid transparent;
    background-clip: content-box;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: ${theme.palette.grey[200]};
  }
`
