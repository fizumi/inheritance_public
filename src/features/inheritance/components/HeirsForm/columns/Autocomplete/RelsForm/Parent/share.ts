import React from 'react'
import { IsParents, IsParent, RelID, JAs } from 'src/features/inheritance/model'
import { pseudoPartner as _pseudoPartner } from 'src/features/inheritance/validation/afterLoad'
import { useBoolean } from 'src/utils/react/hooks'
import { FormikBag } from 'src/libraries/formik'
import { RelsForm } from '../types'

export const context = React.createContext({})

export const pseudoPartner = _pseudoPartner
export interface PnCRelContext {
  formik: FormikBag<IsParent>
  formProps: RelsForm<IsParents>
  jaProps: ReturnType<typeof JAs.getOne>
  pickerOpen: ReturnType<typeof useBoolean>
  relID: RelID
  names: {
    name: string
    parentName: string
  }
  focusErrorFieldRef: React.MutableRefObject<(() => void) | null>
  // index: number
}
