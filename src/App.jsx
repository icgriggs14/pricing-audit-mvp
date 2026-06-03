import { useState } from 'react'

const VERDICT_COLORS = {
  RAISE: '#16a34a',
  LOWER: '#dc2626',
  RESTRUCTURE: '#d97706',
  HOLD: '#2563eb',
}

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const success = params.get('success') === 'true'

  const [form, setForm] = useState({ mrr: '', customers: '', churn: '', tiers: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mrr: form.mrr,
          customers: form.customers,
          churn: form.churn,
          tiers: form.tiers,
        }),
      })
      if (!res.ok) throw new Error('API error: ' + res.status)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setError('Checkout failed: ' + err.message)
      setCheckoutLoading(false)
    }
  }

  const containerStyle = {
    maxWidth: '540px',
    margin: '60px auto',
    padding: '0 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#111',
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '15px',
    border: '1.5px solid #ddd',
    borderRadius: '8px',
    marginBottom: '16px',
    boxSizing: 'border-box',
    outline: 'none',
  }

  if (success) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#10003;</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Payment complete</h2>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Action plan delivered to your email (placeholder — email delivery not yet wired up).
          </p>
          <a href="/" style={{ color: '#2563eb', marginTop: '24px', display: 'inline-block', fontSize: '14px' }}>
            ← Run another audit
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Solo Founder Pricing Audit</h1>
      <p style={{ color: '#666', marginBottom: '32px', fontSize: '15px' }}>
        Enter your metrics and get an instant AI verdict on your pricing strategy.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#444' }}>
          Monthly Recurring Revenue ($)
        </label>
        <input style={inputStyle} type="number" name="mrr" placeholder="e.g. 4200" value={form.mrr} onChange={handleChange} required />

        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#444' }}>
          Customer Count
        </label>
        <input style={inputStyle} type="number" name="customers" placeholder="e.g. 35" value={form.customers} onChange={handleChange} required />

        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#444' }}>
          Monthly Churn (%)
        </label>
        <input style={inputStyle} type="number" name="churn" placeholder="e.g. 3.5" step="0.1" value={form.churn} onChange={handleChange} required />

        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#444' }}>
          Number of Pricing Tiers
        </label>
        <input style={inputStyle} type="number" name="tiers" placeholder="e.g. 3" value={form.tiers} onChange={handleChange} required />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginTop: '4px',
          }}
        >
          {loading ? 'Analyzing…' : 'Get Free Verdict'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '20px', padding: '12px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '32px' }}>
          <div style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: VERDICT_COLORS[result.verdict] || '#111',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '22px',
            fontWeight: '800',
            letterSpacing: '1px',
            marginBottom: '20px',
          }}>
            {result.verdict}
          </div>

          <ul style={{ paddingLeft: '20px', lineHeight: '1.7', color: '#333', fontSize: '15px' }}>
            {result.bullets && result.bullets.map((b, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{b}</li>
            ))}
          </ul>

          <div style={{
            marginTop: '32px',
            padding: '24px',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '1.5px solid #e5e7eb',
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>Get your full action plan</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
              Detailed pricing recommendations, comparable benchmarks, and a step-by-step 30-day action plan.
            </p>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                fontWeight: '700',
                background: checkoutLoading ? '#aaa' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: checkoutLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {checkoutLoading ? 'Redirecting…' : 'Get Full Action Plan ($9)'}
            </button>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', textAlign: 'center' }}>
              One-time payment · Test card: 4242 4242 4242 4242
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
