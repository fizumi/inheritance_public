interface Event {
  preventDefault(): void
  isDefaultPrevented(): boolean
  stopPropagation(): void
}

export const stopPropagationAndPreventDefault =
  <E1 extends Event = Event>(fn: (e: E1) => void) =>
  <E2 extends E1 = E1>(e2: E2): void => {
    e2.stopPropagation()
    e2.preventDefault()
    fn(e2)
  }
