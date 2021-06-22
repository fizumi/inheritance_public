import React from 'react'
import { getFirstErrorFieldPath } from 'src/libraries/formik'
import { useConstRefFunctions, useFieldsRef, useFormikStateRef } from '../../hooks/formik'
import { useCalcInheritance } from './useCalcInheritance'
import Button from '../shared/Button'

// type Props = {}
// TODO: Loading buttons にしたい https://next--material-ui.netlify.app/components/buttons/#loading-buttons
export const CalcInheritanceButton: React.FC = () => {
  const stateRef = useFormikStateRef()
  const calcInharitance = useCalcInheritance()
  const { setValues } = useConstRefFunctions()
  const fieldsRef = useFieldsRef()

  return React.useMemo(() => {
    const errorPath = getFirstErrorFieldPath(stateRef.current.errors)
    return (
      <Button
        onClick={() => {
          console.log('計算')
          if (errorPath !== '') {
            fieldsRef.current[errorPath]?.focus()
            return
          }
          calcInharitance(stateRef.current.values)
            .then((x) => setValues(x) as Promise<void>)
            .catch(console.error)
        }}
      >
        計算
      </Button>
    )
  }, [calcInharitance, fieldsRef, setValues, stateRef])
}
