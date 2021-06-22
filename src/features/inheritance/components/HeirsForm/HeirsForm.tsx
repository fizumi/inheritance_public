// import tb from 'ts-toolbelt'
import { css } from '@emotion/react'
import { Paper, useTheme } from '@material-ui/core'
import React from 'react'
import { FixedSizeList } from 'react-window'
import { DebugStateModal } from 'src/app/hooks/useDebugState'
import { disableTextSelection, flexCenter, notscrollable } from 'src/app/styles/emotion'
import { fontFamily } from 'src/app/styles/static'
import { AppClipboard } from 'src/features/inheritance/components/AppClipboard'
import { ContextMenu } from 'src/features/inheritance/components/ContextMenu'
import { ContextMenu as FieldContextMenu } from 'src/features/inheritance/components/HeirsForm/columns/Autocomplete/ContextMenu'
import {
  useGridDndResizeColContainer,
  useGridDndResizeColRow,
  useResizeHandlers,
  useSize,
} from 'src/features/inheritance/hooks/useDoubleGridWithChangeOrderByDnDAndResizeColumn'
import { useUseSetRowIndex } from 'src/features/inheritance/hooks/useSaveRowIndex'
import { ID } from 'src/features/inheritance/model'
import { setMyDebugMethodToConsole } from 'src/utils/common'
import { useLifecycles, useUpdate } from 'src/utils/react/hooks'
import useDependenciesDebugger, { log } from 'src/utils/react/hooks/useDependenciesDebugger'
import useRenderOnClient from 'src/utils/react/hooks/useRenderOnClient'
import useStyleMemo from 'src/utils/react/hooks/useStyleMemo'
import { useIsSelected } from '../../hooks/useCheckBoxes'
import { useReactWindowInstance } from '../../hooks/useListRef'
import DisappearedLoading from '../shared/loading/DisappearedLoading'
import { columns } from './columns'
import { scrollbar } from './css'

setMyDebugMethodToConsole()
console.setKey('component')

type Props = {
  id: ID
  index: number
}
const RowForms: React.FC<{ id: ID }> = React.memo(({ id }) => {
  console.log('Columns', id)
  return (
    <>
      {columns.map(({ Component }, i) => (
        <Component key={i} id={id} />
      ))}
    </>
  )
})

export const HoverContext = React.createContext<
  React.Dispatch<React.SetStateAction<boolean>> | undefined
>(undefined)

const RowContainer: React.FC<Props & { children: React.FC<{ id: ID }> }> = ({
  id,
  index,
  children,
}) => {
  const theme = useTheme()
  const [isCheckBoxHovered, setIsCheckBoxHovered] = React.useState(false)
  const isSelected = useIsSelected(id)
  const { rowContainerProps, beingDragged } = useGridDndResizeColRow(index)
  const rowContainerPropsM = useStyleMemo(rowContainerProps)
  // useDependenciesDebugger( {beingDragged, id, isCheckBoxHovered, isHovered, isSelected, rowContainerPropsM,  }, log('ColumnsWrapper', index), true) // prettier-ignore

  return React.useMemo(
    () => {
      return (
        <Paper
          data-id={id}
          css={css`
            label: Row;

            height: 5em;

            background-color: ${isSelected
              ? theme.palette.action.selected
              : isCheckBoxHovered
              ? theme.palette.action.hover
              : 'white'};
            display: contents;
            input[type='text'] {
              font-family: ${fontFamily};
            }

            transition: box-shadow 0.3s;
          `}
          {...rowContainerPropsM}
          elevation={beingDragged ? 3 : 0}
        >
          <HoverContext.Provider value={setIsCheckBoxHovered}>
            {React.createElement(children, { id }) /*※1*/}
          </HoverContext.Provider>
        </Paper>
      )
    },
    // ※1 children を ReactElement として受け取って <Provider>{children}</Provider> のように使用すると
    // Did not expect server HTML to contain a <div> in <div>. というエラーが生じる
    // prettier-ignore
    [beingDragged, children, id, isCheckBoxHovered, isSelected, rowContainerPropsM, theme.palette.action.hover, theme.palette.action.selected]
  )
}

const Row: React.FC<Props> = React.memo((props) => {
  return <RowContainer {...props}>{RowForms}</RowContainer>
})

const Loading: React.FC<Props> = (props) => {
  const theme = useTheme()
  return (
    <RowContainer {...props}>
      {() => (
        <div css={flexCenter}>
          <DisappearedLoading size={'small'} color={theme.palette.primary.main} />
        </div>
      )}
    </RowContainer>
  )
}

const RowWrapper: React.FC<Props> = React.memo((props) => {
  const [isFirstRender, setIsFirstRender] = React.useState(true)
  useLifecycles({
    onDidMount: () =>
      setTimeout(() => {
        isFirstRender && setIsFirstRender(false)
      }),
  })
  console.condlog('component', `ColumnsWrapper[${props.index}] in memo`)
  return isFirstRender ? <Loading {...props} /> : <Row {...props} />
})

// isScrolling を使うと レンダリング されていたコンポーネントまで Loading 状態になってしまう。
// ↓ ❗ 重要 (このようにコンポーネント化したものを children として渡さないと react-window 配下のコンポーネントで unmount が発生する)
const FixedSizeListChildren: React.FC<{ index: number; data: ID[] }> = ({ index, data }) => {
  const useSetRowIndex = useUseSetRowIndex()
  useSetRowIndex(index)
  return <RowWrapper index={index} id={data[index]} />
}

const aboutScrollBarWidth = 20 // https://stackoverflow.com/a/40568748

const HeirsForm: React.FC = () => {
  const renderOnClient = useRenderOnClient()
  const theme = useTheme()
  const { items: ids, gridContainerRef, containerStyle } = useGridDndResizeColContainer()
  const ResizeHandles = useResizeHandlers()
  const rwRef = useReactWindowInstance()

  const { itemHeight, rowGap, height } = useSize()

  const rwPropsWithoutGeneric = React.useMemo(() => {
    return {
      ref: rwRef, // https://react-window.vercel.app/#/examples/list/scroll-to-item
      height: height,
      itemCount: ids.length,
      itemSize: itemHeight + rowGap,
      width: '100%',
      overflowX: 'hidden',
      outerRef: gridContainerRef,
      style: containerStyle,
    }
  }, [rwRef, height, ids.length, itemHeight, rowGap, gridContainerRef, containerStyle])

  useDependenciesDebugger( {renderOnClient, ResizeHandles, rwPropsWithoutGeneric, ids, theme}, log('HeirsForm', ''), true) // prettier-ignore
  return React.useMemo(() => {
    return renderOnClient(
      <form
        css={css`
          padding: 1rem 0 1rem 1rem;
          ${disableTextSelection}
          ${notscrollable}
        `}
        noValidate // input に required 属性を指定した時に表示されるメッセージの抑制
      >
        {ResizeHandles}
        <FixedSizeList
          {...rwPropsWithoutGeneric}
          itemData={ids}
          itemKey={(index, data) => data[index]}
          css={scrollbar(theme)}
        >
          {FixedSizeListChildren}
        </FixedSizeList>
        <Display />
        <ContextMenu />
        <FieldContextMenu />
        <AppClipboard />
      </form>
    )
  }, [renderOnClient, ResizeHandles, rwPropsWithoutGeneric, ids, theme])
}

export default HeirsForm

const Display: React.FC = () => {
  const size = useSize()
  const [updateCnt, update] = useUpdate()
  return (
    <div onClick={update} data-manual-update-cnt={updateCnt}>
      <DebugStateModal eventKey={'E'} objArray={[{ size }]} />
    </div>
  )
}
