/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useDrop } from 'react-dnd'
import { ID } from 'src/features/inheritance/model'

export const ItemTypes = {
  CHIP: 'chip',
}

export interface DragObject {
  id: ID
}

export const useDropChip = (onDrop: (id: ID) => void) => {
  const [dropProps, drop] = useDrop(
    () => ({
      accept: ItemTypes.CHIP,
      drop: ({ id }: DragObject) => {
        onDrop(id)
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onDrop]
  )
  return { dropProps, drop }
}
