'use client';

export default function ApiDocsPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">API Documentation</h2>

      <div className="space-y-8">
        {/* Auth section */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Authentication</h3>
          <p className="text-sm text-gray-600 mb-3">
            All API requests require authentication via an API key. Include it in the header:
          </p>
          <CodeBlock code="Authorization: ApiKey pif_your_api_key_here" />
        </section>

        {/* Create Session */}
        <Endpoint
          method="POST"
          path="/api/sessions"
          description="Create a new form session for a client. Returns a token and shareable URL."
          requestBody={`{
  "clientName": "John Smith",
  "clientEmail": "john@example.com",
  "externalUserId": "your-internal-id-123"
}`}
          responseBody={`{
  "sessionId": "uuid",
  "token": "abc123...",
  "formUrl": "https://yourapp.com/form/abc123..."
}`}
        />

        {/* List Sessions */}
        <Endpoint
          method="GET"
          path="/api/sessions"
          description="List all sessions. Optionally filter by status."
          requestBody={null}
          queryParams={[
            { name: 'status', description: 'Filter by ACTIVE, COMPLETED, or EXPIRED' },
          ]}
          responseBody={`{
  "sessions": [
    {
      "id": "uuid",
      "token": "abc123...",
      "clientName": "John Smith",
      "status": "ACTIVE",
      "progress": 45,
      "completedSections": 9,
      "totalSections": 20,
      "address": "42 Acacia Avenue",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}`}
        />

        {/* Get Session */}
        <Endpoint
          method="GET"
          path="/api/sessions/:id"
          description="Get full details of a specific session including all section data."
          requestBody={null}
          responseBody={`{
  "session": {
    "id": "uuid",
    "status": "COMPLETED",
    "propertyForm": {
      "address": "42 Acacia Avenue",
      "sections": [...]
    }
  }
}`}
        />

        {/* Get Session Data */}
        <Endpoint
          method="GET"
          path="/api/sessions/:id/data"
          description="Get the flattened form data for a session — useful for integration."
          requestBody={null}
          responseBody={`{
  "data": {
    "address": "42 Acacia Avenue",
    "postcode": "SW1A 1AA",
    "sellerName": "Jane Doe",
    "status": "COMPLETED",
    "sections": {
      "property_details": {
        "status": "COMPLETED",
        "data": { ... }
      }
    }
  }
}`}
        />

        {/* Download PDF */}
        <Endpoint
          method="GET"
          path="/api/sessions/:id/pdf"
          description="Download the completed Property Information Form as a PDF document."
          requestBody={null}
          responseBody="Binary PDF file (application/pdf)"
        />

        {/* Send Reminder */}
        <Endpoint
          method="POST"
          path="/api/reminders"
          description="Send a reminder email to a client who hasn't completed their form."
          requestBody={`{
  "sessionId": "uuid"
}`}
          responseBody={`{
  "success": true,
  "sentTo": "john@example.com"
}`}
        />

        {/* Webhooks section */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Webhooks</h3>
          <p className="text-sm text-gray-600 mb-3">
            Subscribe to webhook events to be notified when sessions are completed.
          </p>

          <h4 className="text-sm font-bold text-gray-700 mt-4 mb-2">Available Events</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
            <li><code className="bg-gray-100 px-1 rounded">session.completed</code> — Fired when a client submits their form</li>
          </ul>

          <h4 className="text-sm font-bold text-gray-700 mt-4 mb-2">Webhook Payload</h4>
          <CodeBlock code={`{
  "sessionId": "uuid",
  "externalUserId": "your-internal-id",
  "clientName": "John Smith",
  "completedAt": "2024-01-15T14:30:00Z",
  "address": "42 Acacia Avenue",
  "postcode": "SW1A 1AA"
}`} />

          <h4 className="text-sm font-bold text-gray-700 mt-4 mb-2">Verifying Signatures</h4>
          <p className="text-sm text-gray-600 mb-2">
            Each webhook includes a signature in the <code className="bg-gray-100 px-1 rounded">X-PIF-Signature</code> header.
            Verify it using HMAC-SHA256:
          </p>
          <CodeBlock code={`const crypto = require('crypto');

const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(\`\${timestamp}.\${rawBody}\`)
  .digest('hex');

// Compare with X-PIF-Signature header`} />
        </section>

        {/* Manage Webhooks */}
        <Endpoint
          method="POST"
          path="/api/webhooks"
          description="Create a webhook subscription."
          requestBody={`{
  "url": "https://your-server.com/webhook",
  "events": ["session.completed"]
}`}
          responseBody={`{
  "id": "uuid",
  "url": "https://your-server.com/webhook",
  "events": ["session.completed"],
  "secret": "whsec_..."
}`}
        />

        {/* API Keys */}
        <Endpoint
          method="POST"
          path="/api/keys"
          description="Create a new API key."
          requestBody={`{
  "name": "Production Key"
}`}
          responseBody={`{
  "id": "uuid",
  "name": "Production Key",
  "key": "pif_..."
}`}
        />
      </div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="rounded-lg bg-gray-900 p-4 text-sm text-gray-100 overflow-x-auto">
      <code>{code}</code>
    </pre>
  );
}

function Endpoint({
  method,
  path,
  description,
  requestBody,
  responseBody,
  queryParams,
}: {
  method: string;
  path: string;
  description: string;
  requestBody: string | null;
  responseBody: string;
  queryParams?: { name: string; description: string }[];
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-700',
    POST: 'bg-blue-100 text-blue-700',
    PUT: 'bg-yellow-100 text-yellow-700',
    DELETE: 'bg-red-100 text-red-700',
  };

  return (
    <section className="rounded-xl border bg-white overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <span className={`rounded px-2 py-0.5 text-xs font-bold ${methodColors[method] || 'bg-gray-100'}`}>
            {method}
          </span>
          <code className="text-sm font-medium text-gray-900">{path}</code>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {queryParams && (
        <div className="p-4 border-b bg-gray-50">
          <p className="text-xs font-medium text-gray-500 mb-2">Query Parameters</p>
          {queryParams.map(qp => (
            <div key={qp.name} className="text-sm">
              <code className="text-blue-600">{qp.name}</code>
              <span className="text-gray-500"> — {qp.description}</span>
            </div>
          ))}
        </div>
      )}

      {requestBody && (
        <div className="p-4 border-b">
          <p className="text-xs font-medium text-gray-500 mb-2">Request Body</p>
          <CodeBlock code={requestBody} />
        </div>
      )}

      <div className="p-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Response</p>
        {typeof responseBody === 'string' && responseBody.startsWith('{') ? (
          <CodeBlock code={responseBody} />
        ) : (
          <p className="text-sm text-gray-600">{responseBody}</p>
        )}
      </div>
    </section>
  );
}
