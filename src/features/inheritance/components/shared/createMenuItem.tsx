import React, { ComponentProps } from 'react'
import { css } from '@emotion/react'
import { function as F } from 'fp-ts'
import { MenuItem as MuiMenuItem, useTheme } from '@material-ui/core'

type MenuItemProps = ComponentProps<typeof MuiMenuItem> & {
  text: string
  disableAutoClose?: boolean
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createMenuItem = (useClose: () => { handleClose: () => void }) =>
  React.forwardRef(
    (
      { disableAutoClose, text, className: _, ...props }: MenuItemProps,
      ref: React.ForwardedRef<HTMLLIElement>
    ) => {
      const theme = useTheme()
      const { handleClose } = useClose()
      const endOfHandler = disableAutoClose === true ? F.constVoid : handleClose
      const handleClick = props.onClick ? F.flow(props.onClick, endOfHandler) : endOfHandler
      return (
        <MuiMenuItem
          {...props}
          ref={ref}
          onClick={handleClick}
          css={onHover(theme.palette.action.hover)}
        >
          {text}
        </MuiMenuItem>
      )
    }
  )
// theme.palette.action.focus
const onHover = (color: string) => css`
  &:hover {
    background-color: ${color};
  }
`
