import Anthropic from '@anthropic-ai/sdk';
export const config = { runtime: 'nodejs' };
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { mrr, customers, churn, tiers } = req.body || {};
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: `You are a SaaS pricing advisor. Given these metrics for a solo SaaS founder:\n- MRR: $${mrr}\n- Customers: ${customers}\n- Monthly churn: ${churn}%\n- Pricing tiers: ${tiers}\n\nReturn a JSON object with:\n1. verdict: one of RAISE, LOWER, RESTRUCTURE, or HOLD\n2. bullets: array of exactly 3 short rationale strings (each under 20 words)\n\nReturn ONLY the JSON, no other text.` }]
    });
    let text = msg.content[0].text.trim();
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) text = fence[1].trim();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
    const data = JSON.parse(text);
    res.status(200).json(data);
  } catch (err) {
    console.error('audit error:', err);
    res.status(500).json({ error: err.message || 'audit failed' });
  }
}
