import React from 'react'
import { ID, RelationsType } from 'src/features/inheritance/model'
import { PopperProps } from 'src/libraries/@material-ui/core/PopperWitBackDrop'

export interface RelsForm<Rels extends RelationsType = RelationsType>
  extends NonNullable<Pick<PopperProps, 'anchorEl'>> {
  id: ID
  theOtherID: ID
  getIsOpen: () => boolean
  close: () => void
  disableClose: React.MutableRefObject<boolean>
  selectedIDs: readonly ID[]
  curRels: Rels
}
