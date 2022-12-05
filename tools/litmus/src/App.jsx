import { Provider, defaultTheme, Flex } from '@adobe/react-spectrum';

function App() {
  return <Provider theme={defaultTheme} height='100%'>
    <Flex direction="column" height='100%'>
      <div>Hello World</div>
    </Flex>
  </Provider>
}

export default App
