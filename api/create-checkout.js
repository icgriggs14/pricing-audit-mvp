import Stripe from 'stripe';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.origin || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173';
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Pricing Audit — Full Action Plan' }, unit_amount: 900 }, quantity: 1 }],
    success_url: `${origin}/?success=true`,
    cancel_url: `${origin}/`,
  });
  res.status(200).json({ url: session.url });
}
