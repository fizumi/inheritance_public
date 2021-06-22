import React from 'react'
import { css } from '@emotion/react'
import { Checkbox as MuiCheckbox } from '@material-ui/core'
import { useSetHover } from 'src/utils/react/hooks'
import { HoverContext } from '../HeirsForm'
import { ColumnProp } from './types'
import { useCheckBoxes } from '../../../hooks/useCheckBoxes'
import { useIndex } from '../../../hooks/formik/useIndex'

const Checkbox: React.FC<ColumnProp> = ({ id }) => {
  const { checkedIDandIndex, createHandleChange } = useCheckBoxes()
  const index = useIndex(id)
  const setIsCheckBoxHovered = React.useContext(HoverContext)
  const hoveredRef = useSetHover<HTMLButtonElement>(setIsCheckBoxHovered)

  return React.useMemo(() => {
    console.condlog('component', `Checkbox[${index}] in memo`)
    return (
      <MuiCheckbox
        ref={hoveredRef}
        css={css`
          padding: 0;
          .MuiIconButton-label {
            transform: translateY(2px);
          }
          justify-self: start;
        `}
        color="default"
        aria-label="select row"
        size="medium"
        checked={typeof checkedIDandIndex[id] === 'number'}
        onChange={createHandleChange(id, index)}
      />
    )
  }, [index, hoveredRef, checkedIDandIndex, id, createHandleChange])
}
export default Checkbox
