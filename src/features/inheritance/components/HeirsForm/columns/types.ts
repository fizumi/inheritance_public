import React from 'react'
import { ID } from 'src/features/inheritance/model'

export type RootRef = {
  rootRef?:
    | ((instance: HTMLElement | null) => void)
    | undefined
    | null
    | React.RefObject<HTMLElement>
}

export type ColumnProp = {
  id: ID
} & RootRef
