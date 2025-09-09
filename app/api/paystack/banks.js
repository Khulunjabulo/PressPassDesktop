export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.paystack.co/bank?currency=ZAR', {
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    })

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}