import {
  Provider,
  defaultTheme,
  Flex,
  ProgressCircle,
  IllustratedMessage,
  Heading,
  Content,
  ListView,
  Item,
  View,
  Button
} from '@adobe/react-spectrum';
import Error from "@spectrum-icons/illustrations/Error"
import { useEffect, useState } from 'react';

function getEmailHTML() {
  // TODO get from iframe
  return '<h1 style="{ color: green; }">Hello</h1>'
}

const baseUrl = 'https://instant-api.litmus.com/v1';

async function createLitmusEmail(htmlString) {
  const response = await fetch(`${baseUrl}/emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      html_text: htmlString
    }
  })

  if (!response.ok) {
    throw response.error()
  }

  const responseJSON = await response.json()
  const emailGuid = responseJSON['email_guid']

  if (!emailGuid) {
    throw new Error('The litmus API did not return an email GUID.')
  }

  return emailGuid
}

async function getClientConfigurations() {
  const response = await fetch(`${baseUrl}/clients/configurations`)

  if (!response.ok) {
    throw response.error()
  }

  return response.json()
}

function LoadingCircle() {
  return <Flex justifyContent='center' marginTop={'100px'}>
    <ProgressCircle isIndeterminate={true} />
  </Flex>
}

function App() {
  const [loading, setLoading] = useState(true)
  const [configs, setConfigs] = useState(null)
  const [error, setError] = useState(null)

  const [selectedClients, setSelectedClients] = useState(new Set([]))

  useEffect(() => {
    getClientConfigurations().then((configs) => {
      const mappedConfigs = Object.entries(configs)
        .map(([key, value]) => ({ name: `${value.name} (${value.platform})`, id: key }))
        .sort((a, b) => a.name > b.name)
      setConfigs(mappedConfigs)
      setLoading(false)
      console.log(mappedConfigs)
    }).catch(e => setError(e))
  }, [])

  return <Provider theme={defaultTheme} height='100%'>
    <View padding={'20px'}>
      <Flex direction="column" height='100%' gap={'size-200'}>
        <Heading>Simulate Email on Clients (Litmus)</Heading>
        { loading && <LoadingCircle /> }
        { !loading && error && <IllustratedMessage>
          <Error />
          <Heading>Error</Heading>
          <Content>{error}</Content>
        </IllustratedMessage>}
        { !loading && configs &&
          <>
            Select the clients to test:
            <ListView
              aria-label={'list of possible clients'}
              maxHeight={'static-size-6000'}
              items={configs}
              label={"Clients to test"}
              selectionMode={"multiple"}
              selectedKeys={selectedClients}
              onSelectionChange={setSelectedClients}>
              {configs.map(config => <Item key={config.id}>{config.name}</Item>) }
            </ListView>
          </>}
        <Button variant={"accent"}>Simulate Selected Clients</Button>
      </Flex>
    </View>
  </Provider>
}

export default App
