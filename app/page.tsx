/**
 * Home Page - API Test Interface
 *
 * This is a simple test page to demonstrate the API usage.
 * In production, replace this with the full UI from the Master Specification.
 */

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>SEO Analyzer - API Test</h1>

      <div style={{
        background: '#f5f5f5',
        padding: '1.5rem',
        borderRadius: '8px',
        marginTop: '2rem'
      }}>
        <h2>API Endpoint</h2>
        <p><strong>POST</strong> /api/analyze</p>

        <h3 style={{ marginTop: '1.5rem' }}>Request Body:</h3>
        <pre style={{
          background: '#fff',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto'
        }}>
{`{
  "competitorUrl": "https://example.com",
  "myUrl": "https://yoursite.com" // optional
}`}
        </pre>

        <h3 style={{ marginTop: '1.5rem' }}>Example with curl:</h3>
        <pre style={{
          background: '#fff',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '0.9rem'
        }}>
{`curl -X POST http://localhost:3000/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"competitorUrl": "https://example.com"}'`}
        </pre>

        <h3 style={{ marginTop: '1.5rem' }}>Example with JavaScript fetch:</h3>
        <pre style={{
          background: '#fff',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '0.9rem'
        }}>
{`const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    competitorUrl: 'https://example.com',
    myUrl: 'https://yoursite.com' // optional
  })
});

const data = await response.json();
console.log(data);`}
        </pre>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#e3f2fd',
        borderRadius: '8px'
      }}>
        <h2>Features</h2>
        <ul>
          <li>✅ URL validation (protocol, localhost blocking, SERP blocking)</li>
          <li>✅ Robots.txt compliance checking</li>
          <li>✅ Rate limiting (10 requests per hour per IP)</li>
          <li>✅ HTML fetching with 15-second timeout</li>
          <li>✅ Comprehensive SEO analysis (title, meta, headings, content, links)</li>
          <li>✅ Image analysis (alt text coverage)</li>
          <li>✅ Structured data extraction (JSON-LD)</li>
          <li>✅ Technical hints (viewport, charset, favicon)</li>
          <li>✅ Comparison mode (when both URLs provided)</li>
          <li>✅ Detailed error handling</li>
        </ul>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#fff3e0',
        borderRadius: '8px'
      }}>
        <h2>Test URLs</h2>
        <p>Try these URLs to test the API:</p>
        <ul>
          <li><code>https://example.com</code> - Simple test page</li>
          <li><code>https://developer.mozilla.org</code> - Well-optimized page</li>
          <li><code>https://wikipedia.org</code> - Rich structured data</li>
        </ul>

        <p style={{ marginTop: '1rem' }}><strong>Error testing:</strong></p>
        <ul>
          <li><code>https://httpstat.us/404</code> - 404 error</li>
          <li><code>https://google.com/search?q=test</code> - SERP blocking</li>
          <li><code>http://localhost:3000</code> - Localhost blocking</li>
        </ul>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#f9f9f9',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <p>
          <strong>Note:</strong> This is a test interface. In production, implement the full UI
          from the Master Specification with form inputs, loading states, results display,
          and comparison visualization.
        </p>
      </div>
    </main>
  );
}
