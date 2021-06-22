export type RadioOrCheckboxOption = {
  ref: HTMLInputElement
  mutationWatcher?: MutationObserver
}

export type InternalFieldName<TFieldValues extends FieldValues> =
  | (keyof TFieldValues & string)
  | string

export type FieldValue<TFieldValues extends FieldValues> =
  TFieldValues[InternalFieldName<TFieldValues>]

export type FieldValues = Record<string, any>

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export type Ref = FieldElement
