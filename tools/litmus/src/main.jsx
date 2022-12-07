import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './main.css'
import {
  defaultTheme,
  Flex,
  Heading,
  Provider,
  View
} from '@adobe/react-spectrum';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider theme={defaultTheme} height='100%'>
      <View padding={'20px'}>
        <Flex direction="column" height='100%' gap={'size-200'}>
          <Heading>Simulate Email on Clients (Litmus)</Heading>
          <App />
        </Flex>
      </View>
    </Provider>
  </React.StrictMode>
)
