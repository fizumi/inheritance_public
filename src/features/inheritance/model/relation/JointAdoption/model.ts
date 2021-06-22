import tb from 'ts-toolbelt'
import { JointAdoption } from './types'
import { DateKeys } from '../shared/types'

// -------------------------------------------------------------------------------------------------
// Create
// -------------------------------------------------------------------------------------------------
export const create: (args: tb.O.Optional<JointAdoption, 'type' | DateKeys>) => JointAdoption = ({
  type = '共同縁組',
  startDate,
  endDate,
}) => ({
  type,
  startDate: startDate || null,
  endDate: endDate || null,
})

// -------------------------------------------------------------------------------------------------
// Read
// Update
// Delete
// -------------------------------------------------------------------------------------------------
