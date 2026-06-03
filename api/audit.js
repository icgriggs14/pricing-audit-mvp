import Anthropic from '@anthropic-ai/sdk';
export const config = { runtime: 'nodejs' };
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { mrr, customers, churn, tiers } = req.body;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content: `You are a SaaS pricing advisor. Given these metrics for a solo SaaS founder:\n- MRR: $${mrr}\n- Customers: ${customers}\n- Monthly churn: ${churn}%\n- Pricing tiers: ${tiers}\n\nReturn a JSON object with:\n1. verdict: one of RAISE, LOWER, RESTRUCTURE, or HOLD\n2. bullets: array of exactly 3 short rationale strings (each under 20 words)\n\nReturn ONLY the JSON, no other text.` }]
  });
  const data = JSON.parse(msg.content[0].text);
  res.status(200).json(data);
}
