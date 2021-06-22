import Store from '../store'
import { ICanvasSize } from '../types'

export default function getCanvasSize(store: Store): ICanvasSize {
  const maxIndex = store.getMaxIndex()
  return {
    width: maxIndex * 2 + 2,
    height: store.gene.indexes().length * 2,
  }
}
