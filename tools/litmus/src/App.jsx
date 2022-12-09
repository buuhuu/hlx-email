import {
  Flex,
  ProgressCircle,
  IllustratedMessage,
  Heading,
  Content,
  ListView,
  Item,
  Button, Divider
} from '@adobe/react-spectrum';
import ErrorImage from "@spectrum-icons/illustrations/Error"
import React, { useEffect, useState } from 'react';

async function getEmailHTML() {
  return new Promise((resolve, reject) => {
    window.addEventListener('message', ({ data }) => {
        if (data.indexOf('mjml2html:') === 0) {
          resolve(data.substring(10));
        } else {
          reject();
        }
    })

    top.postMessage('mjml2html', '*');
  })
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
    body: JSON.stringify({ html: await getEmailHTML(), clients })
  })

  if (!response.ok) {
    throw new Error(`Error getting client previews: ${response.status}`)
  }

  return response.json()
}

function App() {
  const [loading, setLoading] = useState(true)
  const [configs, setConfigs] = useState(null)
  const [error, setError] = useState(null)

  const configsAsArray = configs ? Object.entries(configs)
    .map(([key, value]) => ({ name: `${value.name} (${value.platform})`, id: key }))
    .sort((a, b) => a.name > b.name) : null;

  const [selectedClients, setSelectedClients] = useState(new Set([]))

  const [previewUrls, setPreviewUrls] = useState(null)

  function handlePreview() {
    const clientsInOrder = [...selectedClients]
    setLoading(true)
    performPreview(clientsInOrder)
      .then((previewUrls) => {
        Object.keys(previewUrls).forEach((key, i) => {
          console.log(clientsInOrder[i])
          previewUrls[key] = { ...previewUrls[key], title: clientsInOrder[i]}
        })
        console.log(previewUrls)
        setPreviewUrls(previewUrls);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => setLoading(false))
  }

  function getPreviews() {
    setLoading(true)
    getClientConfigurations().then((configs) => {
      setConfigs(configs)
      setLoading(false)
    }).catch(e => {
      console.log(e)
      setError(e);
    })
  }

  function handleRestart() {
    setError(null)
    getPreviews()
  }

  useEffect(() => {
    getPreviews()
  }, [])

  if (error) {
    return <>
      <IllustratedMessage>
        <ErrorImage />
        <Heading>Error</Heading>
        <Content>{error.message}</Content>
      </IllustratedMessage>
      <Button variant={"accent"} onPress={handleRestart}>Restart</Button>
    </>
  }

  if (loading) {
    return <LoadingCircle />
  }

  return <>
    { configs && <ListView
      aria-label={'list of possible clients'}
      maxHeight={'static-size-6000'}
      items={configsAsArray}
      label={'Clients to test'}
      selectionMode={'multiple'}
      selectedKeys={selectedClients}
      onSelectionChange={setSelectedClients}>
    >
      {configsAsArray.map(config => <Item key={config.id}>{config.name}</Item>)}
    </ListView> }
    <Button isDisabled={loading || error} variant={"accent"} onPress={handlePreview}>Simulate Selected Clients</Button>
    { previewUrls &&
      <>
        <Divider size={'s'} />
        <Flex gap={'20px'} direction={'column'}>
          {
            previewUrls.map((preview) => <a href={preview.full_url} target={'__blank'}>
              <Heading level={3}>{`${configs[preview.title].name} (${configs[preview.title].platform})`}</Heading>
              <img style={{
                maxWidth: '450px',
                width: '100%'
              }} key={preview.thumb450_url} src={preview.thumb450_url} alt={'preview'} />
            </a>)
          }
        </Flex>
      </>
    }
  </>
}

export default App
