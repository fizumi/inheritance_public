import constate, { name } from 'src/libraries/constate'
import useDoubleGridWithChangeOrderByDnDAndResizeColumn, {
  Props,
} from 'src/utils/fp/react/hooks/useDoubleGridWithChangeOrderByDnDAndResizeColumn/index'
import { ID } from 'src/features/inheritance/model'

export const [
  DoubleGridWithChangeOrderByDnDAndResizeColumnProvider,
  useGridDndResizeColContainer,
  useGetUseGridDndResizeColRow,
  useResetGrid,
  useSize,
  useResizeHandlers,
] = constate(
  (props: Props<ID[]>) => useDoubleGridWithChangeOrderByDnDAndResizeColumn(props), // provide type
  name('useGridDndResizeColContainer')((bag) => bag.container),
  name('useGetUseGridDndResizeColRow')((bag) => bag.useGridDndResizeColRow),
  name('useResetGrid')((bag) => bag.resetGrid),
  name('useSize')((bag) => bag.size),
  name('resizeHandlers')((bag) => bag.resizeHandlers)
)

export const useGridDndResizeColRow = (index: number) => {
  const _useGridDndResizeColRow = useGetUseGridDndResizeColRow()
  return _useGridDndResizeColRow(index)
}
