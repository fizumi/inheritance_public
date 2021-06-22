/* eslint-disable react/jsx-key */
import { Menu as MuiMenu } from '@material-ui/core'
import { function as F } from 'fp-ts'
import * as R from 'ramda'
import React from 'react'
import { COLS } from 'src/features/inheritance/model'
import constate from 'src/libraries/constate'
import { useResetGrid } from '../hooks/useDoubleGridWithChangeOrderByDnDAndResizeColumn'
import { getPosition, useContextMenu } from 'src/utils/fp/react/hooks/useContextMenu'
import {
  useConstRefFunctions,
  useHelperFunctionsForIdMapColumns,
  useValuesRef,
} from '../hooks/formik'
import { useDeleteRows } from '../hooks/formik/useDeleteRows'
import { useCheckBoxes } from '../hooks/useCheckBoxes'
import { createMenuItem } from './shared/createMenuItem'
import { useAppClipboard } from '../hooks/useAppClipboard'

export const [InheritanceContextMenuProvider, useInheritanceContextMenu] = constate(useContextMenu)
const MenuItem = createMenuItem(useInheritanceContextMenu)

export const ContextMenuBox: React.FC<{ className?: string }> = ({ className, children }) => {
  const { handleContextMenu } = useInheritanceContextMenu()
  return (
    <div className={className} onContextMenu={handleContextMenu}>
      {children}
    </div>
  )
}

export const ContextMenu: React.FC = () => {
  const { clientXY, handleClose } = useInheritanceContextMenu()
  const { checkedIDs, checkedIndex, remove, uncheckAll, checkAll } = useCheckBoxes()
  const valuesRef = useValuesRef()
  const { redo, undo } = useConstRefFunctions()
  const resetGrid = useResetGrid()
  const deleteRows = useDeleteRows()
  const { pushPerson, insertPerson } = useHelperFunctionsForIdMapColumns()
  const {
    copiedIDs,
    dispatcher: { clear },
  } = useAppClipboard()
  return (
    <MuiMenu
      keepMounted
      open={clientXY !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={getPosition(clientXY)}
    >
      {checkedIDs.length ? (
        [
          <MenuItem
            key={0}
            text={'選択した行を削除する'}
            onClick={() => F.pipe(checkedIDs, R.tap(deleteRows), remove)}
          />,
          <MenuItem key={1} text={'全てのチェックを外す'} onClick={uncheckAll} />,
        ]
      ) : (
        <MenuItem text={'新しい行を追加する'} onClick={pushPerson} disableAutoClose={true} />
      )}
      {checkedIndex !== null
        ? [
            <MenuItem
              key={0}
              text={'選択した行の上に新しい行を追加する'}
              onClick={() => insertPerson(checkedIndex)}
              disableAutoClose={true}
            />,
            <MenuItem
              key={1}
              text={'選択した行の下に新しい行を追加する'}
              onClick={() => insertPerson(checkedIndex + 1)}
              disableAutoClose={true}
            />,
          ]
        : null}

      <MenuItem text={'全ての行を選択する'} onClick={() => checkAll(valuesRef.current[COLS].id)} />
      <MenuItem text={'列サイズの固定を解除する'} onClick={resetGrid} />
      {copiedIDs.length ? (
        <MenuItem text={'クリップボードのデータを削除する'} onClick={clear} />
      ) : null}
      <MenuItem text={'元に戻す（Ctrl+Z）'} onClick={undo} disableAutoClose={true} />
      <MenuItem text={'やり直す（Ctrl+Y）'} onClick={redo} disableAutoClose={true} />
    </MuiMenu>
  )
}
