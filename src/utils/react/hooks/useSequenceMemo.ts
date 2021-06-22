import React from 'react'

type ObjHavingMemorizedValues = Record<string, any>

const useSequenceMemo = <O extends ObjHavingMemorizedValues>(obj: O): O =>
  React.useMemo(() => obj, [...Object.values(obj)]) // eslint-disable-line react-hooks/exhaustive-deps

export default useSequenceMemo
