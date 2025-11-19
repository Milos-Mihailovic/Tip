const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

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

    const origin = process.env.SUCCESS_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'Tip the creator' },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}?status=success`,
      cancel_url: `${origin}?status=cancel`,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe error', err)
    res.status(500).json({ error: 'Internal error' })
  }
}
