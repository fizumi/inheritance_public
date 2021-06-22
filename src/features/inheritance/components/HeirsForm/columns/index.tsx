import { css } from '@emotion/react'
import Avatar from './Avatar'
import Checkbox from './Checkbox'
import DeathDate from './DeathDate'
import DnDHandle from './DnDHandle'
import Name from './Name'
import Parent from './Parent'
import PortionOfInheritance from './PortionOfInheritance'
import Spouse from './Spouse'
import { ColumnProp } from './types'
import { styled } from 'src/utils/web/styled.echo'
// import { unsafeGetGridTemplateColumnsCount } from 'src/utils/fp/web'

const column = (Component: React.FC<ColumnProp>, disableResizeColum?: boolean) => ({ Component, disableResizeColum, }) // prettier-ignore

export const columns = [
  column(DnDHandle, true),
  column(Avatar, true),
  column(Name),
  column(Parent),
  column(Spouse),
  column(DeathDate),
  column(PortionOfInheritance),
  column(Checkbox, true),
]

export const gridTemplateColumnsCss = styled.echo`
  grid-template-columns: 16px 24px 1fr 2fr 2fr 180px 80px 30px;
`
export const gridTemplateColumns = css`
  ${gridTemplateColumnsCss}
`
// auto を使うと innner html の width によって大きさが変化してしまうため、避ける
//   grid-template-columns: auto auto minmax(100px, 1fr) 2fr 2fr 180px 5em auto 10px;

export const disableResizeColumIndexes = columns.reduce(
  (acc, v, index) => (v.disableResizeColum ? [...acc, index] : acc),
  [] as number[]
)

// export const COLUMN_COUNT = 8
// if (unsafeGetGridTemplateColumnsCount(gridTemplateColumns.styles) !== COLUMN_COUNT)
//   throw Error('invalid column setting')
