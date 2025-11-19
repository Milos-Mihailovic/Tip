const fetch = globalThis.fetch || require('node-fetch')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const { amount } = req.body
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'PayPal credentials not configured' })
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    // Get access token
    const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
    const tokenJson = await tokenRes.json()
    if (!tokenJson.access_token) return res.status(500).json({ error: 'Could not get PayPal token', details: tokenJson })

    const accessToken = tokenJson.access_token

    // Create order
    const orderRes = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'EUR', value: (amount/100).toFixed(2) } }]
      })
    })
    const orderJson = await orderRes.json()
    if (!orderJson.id) return res.status(500).json({ error: 'Could not create order', details: orderJson })

    return res.status(200).json({ id: orderJson.id })
  } catch (err) {
    console.error('PayPal create order error', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
