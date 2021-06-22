import { css } from '@emotion/react'
// import { IconButton } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import DragHandle from '@material-ui/icons/DragHandle'
import { ColumnProp } from './types'
import React from 'react'
import { useGridDndResizeColRow } from 'src/features/inheritance/hooks/useDoubleGridWithChangeOrderByDnDAndResizeColumn'
import { useIndex } from 'src/features/inheritance/hooks/formik'

const DnDHandle: React.FC<ColumnProp> = ({ id }) => {
  const index = useIndex(id)
  const { dndHandlerProps } = useGridDndResizeColRow(index)
  return React.useMemo(() => {
    return (
      <div
        {...dndHandlerProps}
        css={css`
          ${size}
          padding: 0;
          & > .DragHandle {
            color: ${grey[300]};
          }
          &:hover > .DragHandle {
            color: ${grey[700]};
          }
        `}
      >
        <DragHandle className="DragHandle" />
      </div>
    )
  }, [dndHandlerProps])
}
export default DnDHandle

export const size = css`
  width: 1em;
`
