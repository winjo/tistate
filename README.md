# tistate

> React state management with hooks

## Install

```sh
npm install --save tistate
```

## Example
```tsx
const useHook = (initialValue: number) => {
  const [count, setCount] = useState(initialValue)
  const [size, setSize] = useState('')
  const increment = useCallback(() => setCount(c => c + 1), [])
  const decrement = useCallback(() => setCount(c => c - 1), [])
  return {
    count,
    setCount,
    increment,
    decrement,
    size,
    setSize
  }
}

const { Provider, useContainer } = createContainer(useHook)

const Counter: React.FC = () => {
  console.log('Counter update')
  const count = useContainer(state => state.count)
  return <div>count: <span>{count}</span></div>
}

const Sizer: React.FC = () => {
  console.log('Sizer update')
  const size = useContainer(state => state.size)
  return <div>size: <span>{size}</span></div> 
}

const Controller: React.FC = () => {
  console.log('Controller update')
  const { increment, decrement, setSize } = useContainer()
  return (
    <div>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <select onChange={e => setSize(e.target.value)}>
        <option>-- 请选择 --</option>
        <option>small</option>
        <option>middle</option>
        <option>big</option>
      </select>
    </div>
  )
}

const Panel: React.FC = () => (
  <>
    <Counter />
    <Sizer />
    <Controller />
  </>
)

const App: React.FC<{ initialValue?: number }> = (props) => (
  <Provider initialValue={props.initialValue || 0}>
    <Panel />
  </Provider>
)
```