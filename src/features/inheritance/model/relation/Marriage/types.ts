import { Dates } from '../shared'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Marriage extends Pick<Dates, 'endDate'> {
  // startDate: 婚姻日
  // endDate:   離婚日
}
