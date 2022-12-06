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
  Button, Divider
} from '@adobe/react-spectrum';
import ErrorImage from "@spectrum-icons/illustrations/Error"
import { useEffect, useState } from 'react';

function getEmailHTML() {
  // TODO get from iframe
  return '<h1 style="{ color: green; }">Hello</h1>'
}

const litmusBaseUrl = 'https://instant-api.litmus.com/v1';
const proxyBaseUrl = 'https://53444-franklinemail-stage.adobeioruntime.net/api/v1/web/litmus'

function LoadingCircle() {
  return <Flex justifyContent='center' marginTop={'100px'}>
    <ProgressCircle isIndeterminate={true} />
  </Flex>
}

async function getClientConfigurations() {
  const response = await fetch(`${litmusBaseUrl}/clients/configurations`)

  if (!response.ok) {
    throw new Error('Error getting client configs')
  }

  return response.json()
}

async function performPreview(clients) {
  const response = await fetch(`${proxyBaseUrl}/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html: getEmailHTML(), clients })
  })

  if (!response.ok) {
    throw new Error('Error getting client configs')
  }

  return response.json()
}

function App() {
  const [loading, setLoading] = useState(true)
  const [configs, setConfigs] = useState(null)
  const [error, setError] = useState(null)

  const [selectedClients, setSelectedClients] = useState(new Set([]))

  const [previewUrls, setPreviewUrls] = useState(null)

  function handlePreview() {
    setLoading(true)
    performPreview([...selectedClients])
      .then((previewUrls) => setPreviewUrls(previewUrls))
      .catch((error) => {
        setError(error);
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    getClientConfigurations().then((configs) => {
      const mappedConfigs = Object.entries(configs)
        .map(([key, value]) => ({ name: `${value.name} (${value.platform})`, id: key }))
        .sort((a, b) => a.name > b.name)
      setConfigs(mappedConfigs)
      setLoading(false)
    }).catch(e => setError(e))
  }, [])

  return <Provider theme={defaultTheme} height='100%'>
    <View padding={'20px'}>
      <Flex direction="column" height='100%' gap={'size-200'}>
        <Heading>Simulate Email on Clients (Litmus)</Heading>
        { loading && <LoadingCircle /> }
        { !loading && error &&
          <IllustratedMessage>
            <ErrorImage />
            <Heading>Error</Heading>
            <Content>{error.message}</Content>
          </IllustratedMessage>
        }
        { !loading && !error && configs &&
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
        <Button isDisabled={loading} variant={"accent"} onPress={handlePreview}>Simulate Selected Clients</Button>
        {!loading && !error && previewUrls &&
          <>
            <Divider size={'s'} />
            {
              previewUrls.map((preview) => <img key={preview.thumb450} src={preview.thumb450} alt={'preview'} />)
            }
          </>
        }
      </Flex>
    </View>
  </Provider>
}

export default App
