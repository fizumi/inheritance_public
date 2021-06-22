import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useRem, useWindowSize } from 'src/app/hooks'
import { InheritanceContextMenuProvider } from 'src/features/inheritance/components/ContextMenu'
import {
  disableResizeColumIndexes,
  gridTemplateColumnsCss,
} from 'src/features/inheritance/components/HeirsForm/columns'
import { FieldContextMenuProvider } from 'src/features/inheritance/components/HeirsForm/columns/Autocomplete/ContextMenu'
import { MyFormikProvider, MyFormikValues } from 'src/features/inheritance/hooks/formik'
import { AppClipboardProvider } from 'src/features/inheritance/hooks/useAppClipboard'
import { CheckBoxesProvider } from 'src/features/inheritance/hooks/useCheckBoxes'
import { DetectTargetChangeProvider } from 'src/features/inheritance/hooks/useDetectFieldChange'
import { DoubleGridWithChangeOrderByDnDAndResizeColumnProvider } from 'src/features/inheritance/hooks/useDoubleGridWithChangeOrderByDnDAndResizeColumn'
import { ReactWindowInstanceProvider } from 'src/features/inheritance/hooks/useListRef'
import { RowIndexProvider } from 'src/features/inheritance/hooks/useSaveRowIndex'
import { appBarHeight, buttonsHeight } from 'src/features/inheritance/types'
import { MyFormikConfig } from 'src/libraries/formik'
import { unsafeGetGridTemplateColumnsArray } from 'src/utils/fp/web'
import { useUpdate } from 'src/utils/react/hooks'
import { partial, pipeComponents } from 'src/utils/react/utils/pipeComponents'
import { useColumn, useSetColumn } from '../hooks/formik'
import { COLS, RELS, key } from 'src/features/inheritance/model'

const initialValues: MyFormikValues = {
  [COLS]: {
    id: [],
    name: {},
    deathDate: {},
    portionOfInheritance: {},
    isAlive: {},
  },
  [RELS]: {
    [key.isParent]: {},
    [key.marriage]: {},
    [key.jointAdoption]: {},
  },
}

const formikProps: MyFormikConfig<MyFormikValues> = {
  validateOnChange: false,
  validateOnBlur: false,
  initialValues,
  // validationSchema: // formikFieldValidators を使用する
  // ↓ Enter Key で submit されるのを防ぐためこれを利用しない
  onSubmit: () => undefined,
}

const ProviderDependingOnFormik: React.FC = ({ children }) => {
  const [, forceRender] = useUpdate()
  const ids = useColumn('id')
  const setIds = useSetColumn('id')
  const [remSize, ObservedResizeElement] = useRem()
  const wSize = useWindowSize()
  const formSize = {
    height: wSize.height - appBarHeight - buttonsHeight - remSize * 2 - 1, // padding: 1rem を反映 / 1 は over flow 防止のための微調整
    width: wSize.width - remSize * 3 - 10, // 10 は over flow 防止のための微調整
  }
  React.useEffect(() => {
    if (formSize.height < 0 || formSize.width < 0) forceRender()
  }, [forceRender, formSize.height, formSize.width])
  return (
    <DoubleGridWithChangeOrderByDnDAndResizeColumnProvider
      items={ids}
      setItems={setIds}
      containerSize={formSize}
      movingMilliSec={150}
      resizeMin={50}
      rowGap={5}
      itemHeight={75}
      columnGap={10}
      gridTemplateColumnsStyleArray={unsafeGetGridTemplateColumnsArray(gridTemplateColumnsCss)}
      disableResizeColumIndexes={disableResizeColumIndexes}
    >
      {ObservedResizeElement}
      {children}
    </DoubleGridWithChangeOrderByDnDAndResizeColumnProvider>
  )
}

const Provider = pipeComponents(
  partial(MyFormikProvider, formikProps),
  ProviderDependingOnFormik,
  partial(DndProvider, { backend: HTML5Backend }),
  CheckBoxesProvider,
  AppClipboardProvider,
  InheritanceContextMenuProvider,
  FieldContextMenuProvider,
  ReactWindowInstanceProvider,
  DetectTargetChangeProvider,
  RowIndexProvider
)

export default Provider
