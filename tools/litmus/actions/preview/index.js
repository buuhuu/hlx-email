const { default: fetch } = require('node-fetch')

const baseUrl = 'https://instant-api.litmus.com/v1';
const litmusToken = process.env.LITMUS_TOKEN;

async function createLitmusEmail(htmlString) {
  const response = await fetch(`${baseUrl}/emails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${new Buffer(`${litmusToken}:`).toString('base64')}`
    },
    body: JSON.stringify({
      html_text: htmlString
    })
  })

  if (!response.ok) {
    throw new Error(`${response.status}: Error creating email`)
  }

  const responseJSON = await response.json()
  const emailGuid = responseJSON['email_guid']

  if (!emailGuid) {
    throw new Error('The litmus API did not return an email GUID.')
  }

  return emailGuid
}

async function getEmailPreview(guid, client) {
  const response = await fetch(`${baseUrl}/emails/${guid}/preview/${client}`, {
    headers: {
      'Authorization': `Basic ${new Buffer(`${litmusToken}:`).toString('base64')}`
    }
  })

  if (!response.ok) {
    throw new Error(`${response.status}: Error getting preview`)
  }

  return response.json()
}

async function main(params) {
  // return {statusCode: 200, body: "hello world"}
  const { html, clients } = params;

  if (!html || !clients) {
    return { error: { statusCode: 400, body: { error: 'Missing html or client parameters' } } }
  }

  try {
    const guid = await createLitmusEmail(html)
    const clientPromises = clients.map((client) => {
      return getEmailPreview(guid, client)
    })
    const responses = await Promise.all(clientPromises)

    return { statusCode: 200, body: JSON.stringify(responses) }
  } catch (e) {
    return { error: { statusCode: 500, body: { error: e.message } } }
  }
}

exports.main = main
