import { green, lightGreen } from '@material-ui/core/colors'
import { function as F, option as O } from 'fp-ts'
import * as R from 'ramda'
import { default as React } from 'react'
import { toArray } from 'src/utils/common'
import { selectID } from 'src/features/inheritance/hooks/autocomplete/useAutocompleteSettings'
import {
  useConstRefFunctions,
  usePartialRels,
  useValuesRef,
} from 'src/features/inheritance/hooks/formik'
import { ID, IPs, JAs, key, RID, selector } from 'src/features/inheritance/model'
import { MyAutocomplete } from './Autocomplete'
import { useFieldContextHandler } from './Autocomplete/ContextMenu'
import { useHandleOnChange } from './Autocomplete/useHandleOnChange'
import { useRightArrowMenu } from './Autocomplete/useRightArrowMenu'
import { ColumnProp } from './types'

const Parents: React.FC<ColumnProp> = ({ id, rootRef }) => {
  const rKey = key.isParent
  const relsBag = usePartialRels({ rKey, id })
  const { curRels, value } = relsBag

  const ramBag = useRightArrowMenu(rKey, id, curRels) // disableOpenOnSelect
  const { rightArrowMenu } = ramBag
  const { setPnCRels, setRelations } = useConstRefFunctions()

  const handleOnChange = useHandleOnChange(
    rKey,
    {
      'select-option': React.useCallback(
        (args) => {
          console.log('select-option addParentRel')
          setPnCRels(IPs.upsertParentRel(args.option.id, id, curRels))
        },
        [setPnCRels, curRels, id]
      ),
      'remove-option': React.useCallback(
        (args) => {
          console.log('Parents remove option')
          setRelations(
            R.evolve({
              [key.isParent]: IPs.remove(args.option.id, id),
              [key.jointAdoption]: JAs.remove(args.option.id, id),
            })
          )
        },
        [id, setRelations]
      ),
    },
    relsBag as any,
    ramBag,
    value.length < 2
  )

  const valuesRef = useValuesRef()
  const getOptionDisabled = React.useMemo(
    () =>
      F.flow(
        selectID,
        (idFromOption) =>
          IPs.safeGetWithIndex(id, idFromOption)(selector.isParent(valuesRef.current)),
        O.map(([relID]) => {
          return RID.getDst(relID) === id // 親を子として設定しないようにする
          // return false // 親を子として設定しないようにする
        }),
        O.getOrElse(() => false)
      ),
    [id, valuesRef]
  )
  const switchColor: (theOtherID: string) => React.CSSProperties = React.useCallback(
    (theOtherID) =>
      F.pipe(
        IPs.safeGet(theOtherID, id)(selector.isParent(valuesRef.current)),
        O.map((r) => {
          return r.type === '養親子'
            ? { backgroundColor: lightGreen['100'] }
            : r.type === '特別養親子'
            ? { backgroundColor: green['100'] }
            : {}
        }),
        O.getOrElse(() => ({}))
      ),
    [id, valuesRef]
  )

  const setRels = React.useCallback(
    (ids: ID[] | ID) => {
      setPnCRels(IPs.insertParentRels(toArray(ids), id, curRels))
    },
    [curRels, id, setPnCRels]
  )

  const { createHandleContextMenu } = useFieldContextHandler()

  return React.useMemo(() => {
    return (
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
          getOptionDisabled,
          switchColor,
          setRels
        }}
      />
    )
  }, [createHandleContextMenu, curRels, getOptionDisabled, handleOnChange, id, rKey, rightArrowMenu, rootRef, setRels, switchColor, value]) // prettier-ignore
}

export default Parents
