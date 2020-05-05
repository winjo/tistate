import React, { useEffect, useContext, useState, useRef } from 'react'
import shallowEqual from 'shallowequal'

interface Handler<S = any> {
  (state: S): void
}

interface Dispatcher<S = any> {
  on(handler: Handler<S>): () => void
  off(handler: Handler<S>): void
  get(): S | undefined
  update(state: S): void
}

function createDispatcher<S = any>(state?: S): Dispatcher<S> {
  let handlers: Handler[] = []
  return {
    on(handler) {
      handlers.push(handler)
      return () => this.off(handler)
    },
    off(handler) {
      handlers = handlers.filter((h) => h !== handler)
    },
    get() {
      return state
    },
    update(newState) {
      state = newState
      handlers.forEach((handler) => handler(newState))
    },
  }
}

interface HolderProps<S, V> {
  hook(initialValue?: V): S
  dispatcher: Dispatcher<S>
  initialValue: V
}

interface HolderComponent {
  displayName: string
  <S, V = undefined>(props: HolderProps<S, V>): React.ReactElement
}

const Holder = (React.memo<any>(
  (props: any) => {
    const { hook, dispatcher, initialValue } = props
    const firstRender = useRef(true)
    const initialized = useRef(false)

    let data: any
    try {
      data = hook(initialValue)
    } catch (err) {
      console.error('[tistate]: invoke hooks failed', err)
    }

    if (!initialized.current) {
      initialized.current = true
      dispatcher.update(data)
    }

    useEffect(() => {
      if (!firstRender.current) {
        dispatcher.update(data)
      } else {
        firstRender.current = false
      }
    })

    return null
  },
  (prevProps, nextProps) => prevProps.initialValue !== nextProps.initialValue
) as unknown) as HolderComponent

Holder.displayName = 'Holder'

export interface Container<S, V> {
  Provider: React.FC<unknown extends V ? {} : { initialValue: V }>
  useContainer(): S
  useContainer<U>(
    selector: (state: S) => U,
    isEqual?: (s1: S, s2: S) => boolean
  ): U
}

export interface Container1<S, V> {
  Provider: React.FC<{ initialValue?: V }>
  useContainer(): S
  useContainer<U>(
    selector: (state: S) => U,
    isEqual?: (s1: S, s2: S) => boolean
  ): U
}

export function createContainer<S, V>(useHook: () => S): Container<S, V>
export function createContainer<S, V>(
  useHook: (initialValue: V) => S
): Container<S, V>
export function createContainer<S, V>(
  useHook: (initialValue?: V) => S
): Container<S, V> {
  const Context = React.createContext<Dispatcher | null>(null)

  const dispatcher = createDispatcher<S>()!

  const Provider: React.FC<any> = ({ initialValue, children }) => {
    return (
      <>
        <Holder
          hook={useHook}
          dispatcher={dispatcher}
          initialValue={initialValue}
        />
        <Context.Provider value={dispatcher}>{children}</Context.Provider>
      </>
    )
  }

  const useContainer: any = (selector: any, isEqual: any = shallowEqual) => {
    const dispatcher = useContext(Context)

    if (dispatcher === null) {
      throw new Error('[tistate]: Component must be wrapped with <Provider>')
    }

    const lastSelector = useRef(selector)
    lastSelector.current = selector

    const [seletedState, setSelectedState] = useState(() => {
      const state = dispatcher.get()
      return lastSelector.current ? lastSelector.current(state) : state
    })

    const lastSelectedState = useRef(seletedState)

    useEffect(() => {
      const handler = (e: any) => {
        try {
          if (lastSelector.current) {
            const newSelectedState = lastSelector.current(e)
            if (!isEqual(newSelectedState, lastSelectedState.current)) {
              lastSelectedState.current = newSelectedState
              setSelectedState(newSelectedState)
            }
          } else {
            setSelectedState(e)
          }
        } catch (err) {
          console.error('[tistate]: dispatch handler error', err)
        }
      }
      return dispatcher.on(handler)
    }, [])

    return seletedState
  }

  return {
    Provider,
    useContainer,
  }
}
