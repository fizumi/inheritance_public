import { IconButton, InternalStandardProps as StandardProps } from '@material-ui/core'
import { Options, StateRects } from '@popperjs/core'
// import { PopperProps } from '@material-ui/core/Popper'
import ArrowRightIcon from '@material-ui/icons/ArrowRight'
import * as React from 'react'
import Portal from 'src/libraries/@material-ui/core/Portal'
import useForkRef from 'src/utils/react/hooks/useForkRef'
import usePopper from 'src/utils/fp/react/hooks/usePopper'
import styled from '@emotion/styled'

export interface Props extends StandardProps<React.HTMLAttributes<HTMLButtonElement>, 'title'> {
  /**
   * Tooltip reference element.
   */
  children: React.ReactElement<any, any>
  /**
   * Callback fired when the component requests to be closed.
   *
   * @param {object} event The event source of the callback.
   */
  onClose?: (event: React.SyntheticEvent | Event) => void
  /**
   * Callback fired when the component requests to be open.
   *
   * @param {object} event The event source of the callback.
   */
  onOpen?: (event: React.SyntheticEvent) => void
  /**
   * If `true`, the component is shown.
   */
  display: boolean

  onClick?: React.MouseEventHandler<HTMLButtonElement>
  iconButtonAttr?: Record<string, any>
  isSelected?: boolean
  style?: React.CSSProperties
}

export const RightArrow = React.forwardRef<any, Props>((props, ref) => {
  const { children, display, onClick, iconButtonAttr, isSelected } = props

  const [childNode, setChildNode] = React.useState<Element>()
  const [popperElement, setPopperElement] = React.useState<HTMLDivElement | null>(null) // re-rendering を発生させる必要があるため, useRef ではなく, useState

  const handleUseRef = useForkRef(setChildNode, ref)
  const handleRef = useForkRef((children as any).ref, handleUseRef)

  const childrenProps = {
    ...children.props,
    style: { ...children.props.style, position: 'relative' },
    ref: handleRef,
  }

  const modifiers: Options['modifiers'] = React.useMemo(
    () => [
      {
        // https://popper.js.org/docs/v2/modifiers/offset/
        name: 'offset',
        options: {
          offset: (x: StateRects) => {
            return [0, x.popper.height * -1] // width では全体が収まらない
          },
        },
      },
      {
        name: 'preventOverflow',
        enabled: false,
      },
    ],
    []
  )

  // onFirstUpdate 時点では何故か上手く style を計算出来ないものが発生してしまうので, onFirstUpdate で style を固定する方法は諦めた
  // const onFirstUpdate: Options['onFirstUpdate'] = React.useCallback((state) => {
  //   setPopperStyle(state.styles.popper || popperStyle)
  // }, [])

  const popperInstance = usePopper(childNode, popperElement, {
    placement: 'right',
    modifiers,
  })

  // TOP LEVEL RETURN
  if (!display) {
    return children
  }
  return (
    <>
      {React.cloneElement(children, childrenProps)}
      <Portal
        container={childNode} // DOM において popperElement を child component の child として配置
      >
        <Div_Tooltip ref={setPopperElement} style={popperInstance.styles.popper}>
          <IconButton aria-label={''} edge={'end'} onClick={onClick} {...iconButtonAttr}>
            <ArrowRightIcon color={isSelected ? 'primary' : 'inherit'} style={props.style} />
          </IconButton>
        </Div_Tooltip>
      </Portal>
    </>
  )
})
export default RightArrow

const Div_Tooltip = styled.div`
  margin: 0; // createPopper は popper element に margin が存在すると warning を出す
`
