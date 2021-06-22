import * as React from 'react'
import clsx from 'clsx'
import Grow from '@material-ui/core/Grow'
import Paper, { PaperProps } from '@material-ui/core/Paper'
// import Popper, { PopperProps } from '@material-ui/core/Popper'
import Popper, { PopperProps } from 'src/libraries/@material-ui/core/PopperWitBackDrop'
// import TrapFocus, { TrapFocusProps } from '@material-ui/core/Unstable_TrapFocus'
import { useForkRef } from '@material-ui/core/utils'
import { makeStyles } from '@material-ui/styles'
import { TransitionProps } from '@material-ui/core/transitions'
import { useGlobalKeyDown, keycode } from './hooks/useKeyDown'
import { IS_TOUCH_DEVICE_MEDIA } from '../constants/dimensions'
import { executeInTheNextEventLoopTick } from '../_helpers/utils'

export interface ExportedPickerPopperProps {
  /**
   * Popper props passed down to [Popper](https://material-ui.com/api/popper/) component.
   */
  PopperProps?: Partial<PopperProps>
  /**
   * Custom component for [Transition](https://material-ui.com/components/transitions/#transitioncomponent-prop).
   */
  TransitionComponent?: React.ComponentType<TransitionProps>
}

export interface PickerPopperProps extends ExportedPickerPopperProps, PaperProps {
  role: 'tooltip' | 'dialog'
  // TrapFocusProps?: Partial<TrapFocusProps>
  anchorEl: PopperProps['anchorEl']
  open: PopperProps['open']
  onClose: () => void
  onOpen: () => void
}

export const useStyles = makeStyles(
  (theme) => ({
    root: {
      zIndex: theme.zIndex.modal,
    },
    paper: {
      transformOrigin: 'top center',
      '&:focus': {
        [IS_TOUCH_DEVICE_MEDIA]: {
          outline: 0,
        },
      },
    },
    topTransition: {
      transformOrigin: 'bottom center',
    },
  }),
  { name: 'MuiPickersPopper' }
)

export const PickersPopper: React.FC<PickerPopperProps> = (props) => {
  const {
    anchorEl,
    children,
    ref = null,
    onClose,
    onOpen,
    open,
    PopperProps,
    role, // "dialog" in src\my-mui-pickers\wrappers\DesktopWrapper.tsx
    TransitionComponent = Grow,
    // TrapFocusProps,
  } = props
  const classes = useStyles()
  const paperRef = React.useRef<HTMLDivElement>(null)
  // const handlePopperRef = useForkRef(paperRef, innerRef)
  const handlePaperRef = useForkRef<HTMLDivElement>(paperRef, ref)
  const lastFocusedElementRef = React.useRef<Element | null>(null)
  const popperOptions = React.useMemo(() => ({ onFirstUpdate: onOpen }), [onOpen]) // onCreate は存在しない

  useGlobalKeyDown(open, {
    [keycode.Esc]: onClose,
  })

  React.useEffect(() => {
    if (role === 'tooltip') {
      return
    }

    if (open) {
      lastFocusedElementRef.current = document.activeElement
    } else if (
      lastFocusedElementRef.current &&
      lastFocusedElementRef.current instanceof HTMLElement
    ) {
      lastFocusedElementRef.current.focus()
    }
  }, [open, role])

  const handleBlur = () => {
    console.condlog('date picker', 'PickersPopper handleBlur()')
    if (!open) {
      return
    }

    // document.activeElement is updating on the next tick after `blur` called
    executeInTheNextEventLoopTick(() => {
      if (paperRef.current?.contains(document.activeElement)) {
        return
      }

      onClose()
    })
  }

  // // 自分で追加
  // const focusPaper = {
  //   onEntered: () => {
  //     paperRef.current?.focus()
  //   },
  // }

  return (
    <Popper
      transition // ← [*]
      role={role}
      open={open}
      anchorEl={anchorEl}
      className={clsx(classes.root, PopperProps?.className)}
      popperOptions={popperOptions}
      {...PopperProps}
    >
      {({ TransitionProps, placement }) => (
        // ↑ [*] Popper に transition={true} を渡した場合、Popper から Transition 用の props が渡される。
        // <TransitionComponent {...TransitionProps} {...focusPaper}>
        <TransitionComponent {...TransitionProps}>
          <Paper // https://next--material-ui.netlify.app/api/paper
            tabIndex={-1}
            elevation={8}
            ref={handlePaperRef}
            className={clsx(classes.paper, {
              [classes.topTransition]: placement === 'top',
            })}
            onBlur={handleBlur}
          >
            {children /* ← Picker */}
          </Paper>
        </TransitionComponent>
      )}
    </Popper>
  )
}

// TrapFocus の削除について
// ※ TrapFocus があれば, lastFocusedElementRef.current.focus() は不要だが,
// TrapFocus は Unstable であり, 扱い方も難しそうなので, lastFocusedElementRef.current.focus() を使う
// また, TrapFocus は 自分が意図する動作を実現しない（例えば, カレンダーアイコンを押しても Picer Popper が閉じられない等）
