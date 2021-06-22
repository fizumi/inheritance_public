/* eslint-disable react/jsx-key */
import { Menu as MuiMenu, useTheme } from '@material-ui/core'
import React from 'react'
import { ID } from 'src/features/inheritance/model'
import { useAppClipboard } from 'src/features/inheritance/hooks/useAppClipboard'
import constate from 'src/libraries/constate'
import { useContextMenuWithData, getPosition } from 'src/utils/fp/react/hooks/useContextMenu'
import { createMenuItem } from 'src/features/inheritance/components/shared/createMenuItem'

export const [FieldContextMenuProvider, useFieldContextData, useFieldContextHandler] = constate(
  () => useContextMenuWithData<(ids: ID[]) => void>(),
  (value) => value.contextData,
  (value) => value.eventHandler
)
const MenuItem = createMenuItem(useFieldContextHandler)

export const ContextMenu: React.FC = () => {
  const { clientXY, data } = useFieldContextData()
  const { handleClose } = useFieldContextHandler()
  const {
    copiedIDs,
    dispatcher: { clear },
  } = useAppClipboard()
  const theme = useTheme()
  return copiedIDs.length > 0 ? (
    <MuiMenu
      autoFocus={false}
      disableAutoFocusItem
      keepMounted
      open={clientXY !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={getPosition(clientXY)}
      style={{ zIndex: theme.zIndex.modal + 10 }}
    >
      <MenuItem text={'クリップボードの人物を貼り付ける'} onClick={() => data?.(copiedIDs)} />
      <MenuItem
        text={'クリップボードの人物を貼り付けて、クリップボードから削除する'}
        onClick={() => {
          data?.(copiedIDs)
          clear()
        }}
      />
    </MuiMenu>
  ) : null
}
