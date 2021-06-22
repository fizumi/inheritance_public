import { grey } from '@material-ui/core/colors'
import { function as F, option as O } from 'fp-ts'
import React from 'react'
import { toArray, reduceFns } from 'src/utils/common'
import {
  useConstRefFunctions,
  usePartialRels,
  useValuesRef,
} from 'src/features/inheritance/hooks/formik'
import { ID, key, Mrrg, Mrrgs, selector } from 'src/features/inheritance/model'
import { MyAutocomplete } from './Autocomplete'
import { useFieldContextHandler } from './Autocomplete/ContextMenu'
import { useHandleOnChange } from './Autocomplete/useHandleOnChange'
import { useRightArrowMenu } from './Autocomplete/useRightArrowMenu'
import { ColumnProp } from './types'

const Spouses: React.FC<ColumnProp> = ({ id, rootRef }) => {
  const rKey = key.marriage
  const relsBag = usePartialRels({ rKey, id })
  const { value, curRels } = relsBag
  const { setMarriageRels } = useConstRefFunctions()

  const ramBag = useRightArrowMenu(rKey, id, curRels)
  const { rightArrowMenu } = ramBag

  const handleOnChange = useHandleOnChange(
    rKey,
    {
      'select-option': React.useCallback(
        (args) => setMarriageRels(Mrrgs.upsertAt(id, args.option.id, Mrrg.create({}))),
        [id, setMarriageRels]
      ),
      'remove-option': React.useCallback(
        (args) => setMarriageRels(Mrrgs.remove(id, args.option.id)),
        [setMarriageRels, id]
      ),
    },
    relsBag as any, // useRelations の return をそのまま渡すだけなので any を許容
    ramBag
  )

  const valuesRef = useValuesRef()
  const switchColor: (theOtherID: string) => React.CSSProperties = React.useCallback(
    (theOtherID) =>
      F.pipe(
        Mrrgs.safeGet(theOtherID, id)(selector.marriage(valuesRef.current)),
        O.map((r) => {
          return r.endDate ? { backgroundColor: grey['200'], color: grey['500'] } : {}
        }),
        O.getOrElse(() => ({}))
      ),
    [id, valuesRef]
  )

  const setRels = React.useCallback(
    (ids: ID[] | ID) => {
      const upsert = reduceFns(
        toArray(ids).map((partnerID) => Mrrgs.insertAt(partnerID, id, Mrrg.create({})))
      )
      setMarriageRels(upsert)
    },
    [id, setMarriageRels]
  )

  const { createHandleContextMenu } = useFieldContextHandler()

  return React.useMemo(
    () => (
      <MyAutocomplete
        {...{
          id,
          rKey,
          handleOnChange,
          handleContextMenu: createHandleContextMenu(setRels),
          rootRef,
          value,
          rightArrowMenu,
          curRels,
          switchColor,
          setRels,
        }}
      />
    ),
    [id, rKey, handleOnChange, createHandleContextMenu, setRels, rootRef, value, rightArrowMenu, curRels, switchColor] // prettier-ignore
  )
}

export default Spouses
