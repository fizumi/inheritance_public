// https://github.com/mui-org/material-ui/blob/next/packages/material-ui/src/Popper/Popper.js
import * as React from 'react'
import {
  createPopper,
  Instance,
  VirtualElement,
  Options,
  OptionsGeneric,
  State,
} from '@popperjs/core'
// import { DefaultTheme, useTheme } from '@material-ui/styles'
// import { useTheme } from '@material-ui/styles'
import { useTheme } from '@material-ui/core'
import { setRef } from '@material-ui/core/utils' // https://github.com/mui-org/material-ui/blob/next/packages/material-ui-utils/src/setRef.ts
import useForkRef from '@material-ui/utils/useForkRef'
import useEnhancedEffect from '@material-ui/utils/useEnhancedEffect'
import Portal from './BodyPortal'
import { css } from '@emotion/react'

export type PopperPlacementType = Options['placement']

type ChildrenProps = {
  placement: PopperPlacementType
  TransitionProps?: {
    in: boolean
    onEnter: () => void
    onExited: () => void
  }
}

export interface PopperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: React.Ref<HTMLDivElement>
  /**
   * A HTML element, [virtualElement](https://popper.js.org/docs/v2/virtual-elements/),
   * or a function that returns either.
   * It's used to set the position of the popper.
   * The return value will passed as the reference object of the Popper instance.
   */
  anchorEl?: null | VirtualElement | (() => VirtualElement)
  /**
   * Popper render function or node.
   */
  children?: React.ReactNode | ((props: ChildrenProps) => React.ReactNode)
  /**
   * A HTML element or function that returns one.
   * The `container` will have the portal children appended to it.
   *
   * By default, it uses the body of the top-level document object,
   * so it's simply `document.body` most of the time.
   */
  // container?: PortalProps['container']
  /**
   * The `children` will be inside the DOM hierarchy of the parent component.
   * @default false
   */
  // disablePortal?: PortalProps['disablePortal']
  /**
   * Always keep the children in the DOM.
   * This prop can be useful in SEO situation or
   * when you want to maximize the responsiveness of the Popper.
   * @default false
   */
  keepMounted?: boolean
  /**
   * Popper.js is based on a "plugin-like" architecture,
   * most of its features are fully encapsulated "modifiers".
   *
   * A modifier is a function that is called each time Popper.js needs to
   * compute the position of the popper.
   * For this reason, modifiers should be very performant to avoid bottlenecks.
   * To learn how to create a modifier, [read the modifiers documentation](https://popper.js.org/docs/v2/modifiers/).
   */
  modifiers?: Options['modifiers']
  /**
   * If `true`, the popper is visible.
   */
  open: boolean
  /**
   * Popper placement.
   * @default 'bottom'
   */
  placement?: PopperPlacementType
  /**
   * Options provided to the [`Popper.js`](https://popper.js.org/docs/v2/constructors/#options) instance.
   * @default {}
   */
  popperOptions?: Partial<OptionsGeneric<any>>
  /**
   * A ref that points to the used popper instance.
   */
  // popperRef?: React.Ref<Instance>
  popperRef?: React.Ref<Instance | null>
  /**
   * Help supporting a react-transition-group/Transition component.
   * @default false
   */
  transition?: boolean

  /**
   * !!onBackdropClick === true の場合のみ, backdrop が表示される
   */
  onBackdropClick?: () => void
}

type Modifiers = Options['modifiers']

function flipPlacement(placement: PopperPlacementType, theme: any) {
  const direction = (theme && theme?.direction) || 'ltr'

  if (direction === 'ltr') {
    return placement
  }

  switch (placement) {
    case 'bottom-end':
      return 'bottom-start'
    case 'bottom-start':
      return 'bottom-end'
    case 'top-end':
      return 'top-start'
    case 'top-start':
      return 'top-end'
    default:
      return placement
  }
}

function getAnchorEl(anchorEl: VirtualElement | (() => VirtualElement)) {
  return typeof anchorEl === 'function' ? anchorEl() : anchorEl
}

const defaultPopperOptions = {} as Partial<OptionsGeneric<any>>

/**
 * Poppers rely on the 3rd party library [Popper.js](https://popper.js.org/docs/v2/) for positioning.
 */
const Popper = React.forwardRef(function Popper(props: PopperProps, ref) {
  const {
    anchorEl,
    children,
    keepMounted = false,
    modifiers,
    open,
    placement: initialPlacement = 'bottom',
    popperOptions = defaultPopperOptions,
    popperRef: popperRefProp,
    style,
    transition = false,
    onBackdropClick,
    ...other
  } = props

  const tooltipRef = React.useRef<HTMLElement>(null)
  const ownRef = useForkRef(tooltipRef, ref)

  const popperRef = React.useRef<Instance>(null)

  // useForkRef は undefined も受け入れている。
  const handlePopperRef = useForkRef(popperRef, popperRefProp as any) as
    | null
    | ((instance: Instance | null) => void)
  const handlePopperRefRef = React.useRef<null | ((instance: Instance | null) => void)>(
    handlePopperRef
  )
  useEnhancedEffect(() => {
    handlePopperRefRef.current = handlePopperRef
  }, [handlePopperRef])

  const setPopperRef = (instance: null | Instance) =>
    handlePopperRefRef.current && handlePopperRefRef.current(instance)

  // （多分）Popper に popperRef={ref} として渡した ref に popperRef.current を代入する。
  // 親ｺﾝﾎﾟｰﾈﾝﾄで popperRef.current を利用できるようになる。
  React.useImperativeHandle(popperRefProp, () => popperRef.current, [])

  const [exited, setExited] = React.useState(true)

  const theme = useTheme()
  const rtlPlacement = flipPlacement(initialPlacement, theme)
  /**
   * placement initialized from prop but can change during lifetime if modifiers.flip.
   * modifiers.flip is essentially a flip for controlled/uncontrolled behavior
   */
  const [placement, setPlacement] = React.useState(rtlPlacement)

  React.useEffect(() => {
    if (popperRef.current) {
      popperRef.current.forceUpdate()
    }
  })

  const handleOpen = React.useCallback(() => {
    if (!tooltipRef.current || !anchorEl || !open) {
      return
    }

    // 前回情報を破棄
    if (popperRef.current) {
      popperRef.current.destroy()
      setPopperRef(null)
    }

    const handlePopperUpdate = (data: State) => {
      setPlacement(data.placement)
    }

    const resolvedAnchorEl = getAnchorEl(anchorEl)
    if (process.env.NODE_ENV !== 'production') {
      if (resolvedAnchorEl && (resolvedAnchorEl as any).nodeType === 1) {
        const box = resolvedAnchorEl.getBoundingClientRect()

        if (
          process.env.NODE_ENV !== 'test' &&
          box.top === 0 &&
          box.left === 0 &&
          box.right === 0 &&
          box.bottom === 0
        ) {
          console.warn(
            [
              'Material-UI: The `anchorEl` prop provided to the component is invalid.',
              'The anchor element should be part of the document layout.',
              "Make sure the element is present in the document or that it's not display none.",
            ].join('\n')
          )
        }
      }
    }

    // v2 popper で増えた部分
    let popperModifiers = [
      {
        name: 'preventOverflow',
        options: {
          altBoundary: false,
        },
      },
      {
        name: 'flip',
        options: {
          altBoundary: false,
        },
      },
      {
        name: 'onUpdate',
        enabled: true,
        phase: 'afterWrite',
        fn: ({ state }) => {
          handlePopperUpdate(state) // ここで popper から情報を受け取る
        },
      },
    ] as Modifiers

    // 引数の情報を反映
    if (modifiers != null) {
      popperModifiers = popperModifiers.concat(modifiers)
    }
    if (popperOptions && popperOptions.modifiers != null) {
      popperModifiers = popperModifiers.concat(popperOptions.modifiers)
    }

    // tooltipRef.current を渡すことで，
    // createPopper 内で style を適用してくれる
    const popper = createPopper(getAnchorEl(anchorEl), tooltipRef.current, {
      placement: rtlPlacement,
      ...popperOptions,
      modifiers: popperModifiers,
    })

    setPopperRef(popper)
  }, [anchorEl, modifiers, open, rtlPlacement, popperOptions])

  const handleRef = React.useCallback(
    (node) => {
      setRef(ownRef, node)
      handleOpen()
    },
    [ownRef, handleOpen]
  )

  const handleEnter = () => {
    setExited(false)
  }

  const handleClose = () => {
    if (!popperRef.current) {
      return
    }

    popperRef.current.destroy()
    setPopperRef(null)
  }

  const handleExited = () => {
    setExited(true)
    handleClose()
  }

  React.useEffect(() => {
    return () => {
      handleClose()
    }
  }, [])

  React.useEffect(() => {
    if (!open && !transition) {
      // Otherwise handleExited will call this.
      handleClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transition])

  // 注 Top Level return
  if (!keepMounted && !open && (!transition || exited)) {
    return null
  }

  const childProps = { placement } as ChildrenProps

  if (transition) {
    // eslint-disable-next-line no-extra-semi
    childProps.TransitionProps = {
      in: open,
      onEnter: handleEnter,
      onExited: handleExited,
    }
  }

  // If the container prop is provided, use that
  // If the anchorEl prop is provided, use its parent body element as the container
  // If neither are provided let the Modal take care of choosing the container
  // const container =
  //   containerProp || (anchorEl ? ownerDocument(getAnchorEl(anchorEl)).body : undefined);

  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    onBackdropClick?.()
    e.stopPropagation()
  }

  const backOfModal = theme.zIndex.modal - 1
  return (
    <>
      <Portal>
        <div
          ref={handleRef}
          role="tooltip"
          {...other}
          style={{
            // Prevents scroll issue, waiting for Popper.js to add this style once initiated.
            position: 'fixed',
            // Fix Popper.js display issue
            top: 0,
            left: 0,
            ...(!open && keepMounted && !transition ? { display: 'none' } : {}),
            zIndex: theme.zIndex.modal,
            ...style,
          }}
        >
          {typeof children === 'function' ? children(childProps) : children}
        </div>
      </Portal>
      {onBackdropClick ? (
        <Portal>
          <div css={backdrop} onClick={handleBackdropClick} style={{ zIndex: backOfModal }} />
        </Portal>
      ) : null}
    </>
  )
})

export default Popper

const backdrop = css`
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
`
