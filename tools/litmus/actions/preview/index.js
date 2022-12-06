import fetch from 'node-fetch';

const baseUrl = 'https://instant-api.litmus.com/v1';
const litmusToken = process.env.LITMUS_TOKEN;

async function createLitmusEmail(htmlString) {
  const response = await fetch(`${baseUrl}/emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html_text: htmlString
    })
  })

  if (!response.ok) {
    throw new Error('Error creating email')
  }

  const responseJSON = await response.json()
  const emailGuid = responseJSON['email_guid']

  if (!emailGuid) {
    throw new Error('The litmus API did not return an email GUID.')
  }

  return emailGuid
}

async function getEmailPreview(guid, client) {
  const response = await fetch(`${baseUrl}/emails/${guid}/preview/${client}`)

  if (!response.ok) {
    throw new Error('Error getting preview')
  }

  return response.json()
}

export async function main(params) {
  const { html, clients } = params;

  if (!html || !clients) {
    return { statusCode: 400 }
  }

  const guid = await createLitmusEmail(html)
  const clientPromises = clients.map((client) => {
    return getEmailPreview(guid, client)
  })
  const responses = await Promise.all(clientPromises)

  return { statusCode: 200, body: JSON.stringify(responses) }
}
