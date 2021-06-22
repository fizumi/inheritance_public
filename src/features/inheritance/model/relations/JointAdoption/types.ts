import { JointAdoption, RelID2to1 } from '../../relation'
import { Rel2Store } from '../shared'

export type JointAdoptions = Rel2Store<JointAdoption, RelID2to1>
