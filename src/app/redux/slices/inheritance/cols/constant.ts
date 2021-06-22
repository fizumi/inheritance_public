import { COLS } from 'src/features/inheritance/model'
import { path as parent } from '../constant'

export const field = COLS
export const path = [...parent, field] as const
