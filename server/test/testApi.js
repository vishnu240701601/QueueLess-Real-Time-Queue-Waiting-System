// =====================================================================
// QueueLess – Automated Backend API Integration Test
// Validates endpoint routing, security headers, auth guards, and 404 handlers
// =====================================================================

const http = require('http');
const app = require('../src/app');

function makeRequest(server, path, options = {}) {
  const port = server.address().port;
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 Starting QueueLess Backend API Tests...');
  console.log('========================================\n');

  const server = app.listen(0); // dynamically allocated free port

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  try {
    // 1. Health check test
    await test('Health check endpoint returns healthy status 200', async () => {
      const res = await makeRequest(server, '/api/health');
      if (res.status !== 200 || res.data.status !== 'healthy') {
        throw new Error(`Expected 200 healthy, got ${res.status}: ${JSON.stringify(res.data)}`);
      }
    });

    // 2. 404 endpoint test
    await test('Non-existent route returns 404 structured JSON', async () => {
      const res = await makeRequest(server, '/api/non-existent-route-xyz');
      if (res.status !== 404 || res.data.error !== 'ENDPOINT_NOT_FOUND') {
        throw new Error(`Expected 404 ENDPOINT_NOT_FOUND, got ${res.status}`);
      }
    });

    // 3. Protected endpoint authentication requirement
    await test('POST /api/tokens rejects unauthenticated request with 401', async () => {
      const res = await makeRequest(server, '/api/tokens', {
        method: 'POST',
        body: { service_id: '11111111-1111-1111-1111-111111111111' }
      });
      if (res.status !== 401 || res.data.error !== 'UNAUTHORIZED') {
        throw new Error(`Expected 401 UNAUTHORIZED, got ${res.status}`);
      }
    });

    // 4. Protected staff endpoint authentication requirement
    await test('POST /api/staff/tokens/:id/call rejects unauthenticated request with 401', async () => {
      const res = await makeRequest(server, '/api/staff/tokens/11111111-1111-1111-1111-111111111111/call', {
        method: 'POST'
      });
      if (res.status !== 401 || res.data.error !== 'UNAUTHORIZED') {
        throw new Error(`Expected 401 UNAUTHORIZED, got ${res.status}`);
      }
    });

    // 5. Protected admin endpoint authentication requirement
    await test('POST /api/admin/services rejects unauthenticated request with 401', async () => {
      const res = await makeRequest(server, '/api/admin/services', {
        method: 'POST',
        body: { name: 'Test Counter' }
      });
      if (res.status !== 401 || res.data.error !== 'UNAUTHORIZED') {
        throw new Error(`Expected 401 UNAUTHORIZED, got ${res.status}`);
      }
    });

    // 6. Invalid UUID parameter validation
    await test('GET /api/services/not-a-valid-uuid rejects with 400 INVALID_ID', async () => {
      const res = await makeRequest(server, '/api/services/invalid-id-string');
      if (res.status !== 400 || res.data.error !== 'INVALID_ID') {
        throw new Error(`Expected 400 INVALID_ID, got ${res.status}: ${JSON.stringify(res.data)}`);
      }
    });

    console.log(`\n========================================`);
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (globalErr) {
    console.error('Test Runner Error:', globalErr);
    server.close();
    process.exit(1);
  }
}

runTests();
