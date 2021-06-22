import { AllFieldKeys, ID } from 'src/features/inheritance/model'
import constate from 'src/libraries/constate'
import useSubject from 'src/utils/react/hooks/useSubject'

type TargetID = Partial<Record<AllFieldKeys | 'hoveredChip', ID>>
export const [DetectTargetChangeProvider, useDetectTargetChange] = constate(() =>
  useSubject<TargetID>()
)
