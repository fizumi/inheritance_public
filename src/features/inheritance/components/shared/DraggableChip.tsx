import Chip, { ChipProps } from '@material-ui/core/Chip'
import Tippy from '@tippyjs/react'
import React from 'react'
import { useDrag } from 'react-dnd'
import { useForkRef, useCancelAndDelay, useHover } from 'src/utils/react/hooks'
import { useDetectTargetChange } from 'src/features/inheritance/hooks/useDetectFieldChange'
import {
  DragObject,
  ItemTypes,
} from 'src/features/inheritance/components/HeirsForm/columns/Autocomplete/useDropChip'
import { useAppClipboardDispatcher } from 'src/features/inheritance/hooks/useAppClipboard'
import { stopPropagationAndPreventDefault } from 'src/utils/web/event'
import { useSolidBorder } from 'src/features/inheritance/hooks/useSolidBorder'
import { useFocus } from 'src/features/inheritance/hooks/formik'

export const DraggableChip: React.FC<ChipProps & DragObject & { disablePushToCB?: boolean }> =
  React.forwardRef(({ id, disablePushToCB = false, ...other }, ref) => {
    const { solidBorder } = useSolidBorder()
    const { push } = useAppClipboardDispatcher()
    const [, drag] = useDrag(
      () => ({
        type: ItemTypes.CHIP,
        item: { id },
      }),
      [id]
    )
    const { subject, useSubscribe } = useDetectTargetChange()

    const [hoveredThisID, setHoveredThisID] = React.useState(false)
    const { hoveredRef, isHovered } = useHover()
    // useEffect だと上手く動作しない
    useCancelAndDelay(
      () => {
        subject.next({
          hoveredChip: isHovered ? id : '',
        })
      },
      [isHovered],
      0
    )

    useSubscribe(
      () => ({
        next(fieldChange) {
          if (hoveredThisID === false && fieldChange.hoveredChip === id) setHoveredThisID(true)
          if (hoveredThisID === true && fieldChange.hoveredChip === '') setHoveredThisID(false)
        },
      }),
      [hoveredThisID]
    )

    const delayedFocus = useFocus('name')

    const ref2 = useForkRef(ref, drag)
    const ref3 = useForkRef(ref2, hoveredRef)
    return (
      <Tippy
        content={
          <span>
            ダブルクリックで名前をフォーカス
            <br />
            右クリックでクリップボードにコピー
          </span>
        }
        disabled={disablePushToCB}
        arrow
        placement={'top'}
        delay={[1000, null]}
      >
        <Chip
          {...other}
          ref={ref3}
          onDoubleClick={() => delayedFocus(id)}
          style={{ ...other.style, cursor: 'move', ...(hoveredThisID ? solidBorder : {}) }}
          onContextMenu={stopPropagationAndPreventDefault(() => !disablePushToCB && push(id))} // right click : https://stackoverflow.com/a/4236294
        />
      </Tippy>
    )
  })
