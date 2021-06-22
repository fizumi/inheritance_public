import { constVoid, flow, pipe } from 'fp-ts/function'
import * as R from 'ramda'
import React from 'react'
import { RelationKey } from 'src/features/inheritance/model'
import {
  AutocompleteProps,
  OnChangeParams,
} from 'src/utils/fp/react/components/@material-ui/FreeSoloMultipleAutocomplete'
import tb from 'ts-toolbelt'
import {
  useHelperFunctionsForIdMapColumns,
  usePartialRels,
  useRelations,
} from 'src/features/inheritance/hooks/formik'
import { omitExtra, Opt } from 'src/features/inheritance/hooks/autocomplete/useAutocompleteSettings'
import { useRightArrowMenu } from './useRightArrowMenu'

type OnChangeParamsWithOpt = tb.U.Select<OnChangeParams<Opt>, { option: Opt }, 'extends->'>
type OnChangeFns = {
  clear: () => void
  'remove-option': (args: OnChangeParamsWithOpt) => void
  'select-option': (args: OnChangeParamsWithOpt) => void
  // 'create-option': (args: OnChangeParamsWithOpt) => void
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useHandleOnChange = <K extends RelationKey>(
  relKey: K,
  {
    'select-option': select_,
    clear = constVoid,
    'remove-option': remove = constVoid,
  }: {
    'select-option': OnChangeFns['select-option']
    clear?: OnChangeFns['clear']
    'remove-option'?: OnChangeFns['remove-option']
  },
  { curRels }: ReturnType<typeof usePartialRels>,
  { rightArrowMenu, setOptionElByIndex }: ReturnType<typeof useRightArrowMenu>,
  disableOpenOnSelect = false
) => {
  const { compensatePush } = useHelperFunctionsForIdMapColumns()
  const { getRelations, setRels } = useRelations(relKey)

  const select = React.useCallback<typeof select_>(
    (args) => {
      select_(args)
      !disableOpenOnSelect && setOptionElByIndex(args.optionIndex)
    },
    [disableOpenOnSelect, select_, setOptionElByIndex]
  )

  const addRow = React.useMemo(() => flow(omitExtra, compensatePush), [compensatePush])

  const create: OnChangeFns['select-option'] = React.useCallback(
    (args) => pipe(addRow(args.option), () => select(args)),
    [addRow, select]
  )
  const onChangeFns: OnChangeFns = React.useMemo(
    () => ({
      clear: () => pipe(R.without(curRels as any[], getRelations() as any[]), setRels, clear),

      'remove-option': (args: OnChangeParamsWithOpt) => {
        console.condlog('Autocomplete', 'remove-option', {
          curRels,
          'args.option.id': args.option.id,
        })
        remove(args)
        if (rightArrowMenu.otherDeps.curTheOtherID === args.option.id) {
          rightArrowMenu.forceClose()
        }
      },

      'select-option': (args) => (args.option?.display ? create(args) : select(args)),
      // display がある -> 新しいoption
    }),
    [curRels, getRelations, setRels, clear, remove, rightArrowMenu, create, select]
  )

  const disableChange: (args: OnChangeParams<Opt>) => boolean = React.useCallback(
    (args) => {
      if (args.reason === 'clear') return false

      if (args.reason === 'remove-option') return false

      if (args.reason === 'select-option') return rightArrowMenu.disableClose.current

      console.warn('unknown reason', args.reason)
      return true
    },
    [rightArrowMenu.disableClose]
  )

  const handleOnChange = React.useCallback<NonNullable<AutocompleteProps<Opt>['onChange']>>(
    (args) => {
      console.condlog('Autocomplete', 'handleOnChange', args)
      if (disableChange(args)) return
      onChangeFns[args.reason](args as any)
    },
    [onChangeFns, disableChange]
  )

  return handleOnChange
}
