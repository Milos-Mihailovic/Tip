const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const fs = require('fs')

// Helper to read raw request body
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', (err) => reject(err))
  })
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  try {
    const buf = await getRawBody(req)
    const sig = req.headers['stripe-signature']

    let event
    if (webhookSecret && sig) {
      // Verify the signature using the webhook secret
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
    } else {
      // Fallback: try parsing JSON (useful for local demo without signature)
      event = JSON.parse(buf.toString('utf8'))
    }

    // Basic handling of a couple of event types for demo
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      console.log('Checkout session completed:', session.id, session.amount_total)
      // Append to a simple log file for demo purposes
      try {
        fs.appendFileSync('webhook.log', JSON.stringify({ type: event.type, id: session.id, amount: session.amount_total, time: Date.now() }) + '\n')
      } catch (e) {
        console.warn('Could not write webhook log', e)
      }
    } else {
      console.log('Received stripe event:', event.type)
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('Webhook error', err.message || err)
    return res.status(400).send(`Webhook Error: ${err.message || err}`)
  }
}
