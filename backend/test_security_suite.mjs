import http from 'http';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test_audit_secret_key_1234567890!';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'hotel_test_db';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'test_password_123';
process.env.NODE_ENV = 'test';

const { default: app } = await import('./src/server.js');
const JWT_SECRET = process.env.JWT_SECRET;

let server;
const PORT = 5099;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, port: PORT, host: '127.0.0.1' }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (_) {}
        resolve({ statusCode: res.statusCode, headers: res.headers, body: json || body });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runSecurityTests() {
  console.log('\n======================================================');
  console.log('  ELYSIA HOTEL MANAGEMENT SYSTEM — SECURITY TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function assertTest(name, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      console.error(`  ❌ [FAIL] ${name} — ${details}`);
    }
  }

  // Create JWT tokens for testing
  const customerToken = jwt.sign(
    { id: 'usr-cust-test', name: 'Test Customer', email: 'customer@test.com', role: 'customer' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const managerToken = jwt.sign(
    { id: 'usr-mgr-test', name: 'Test Manager', email: 'manager@test.com', role: 'manager' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const adminToken = jwt.sign(
    { id: 'usr-admin-test', name: 'Test Admin', email: 'admin@test.com', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const receptionistToken = jwt.sign(
    { id: 'usr-rec-test', name: 'Test Receptionist', email: 'receptionist@test.com', role: 'receptionist' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // ── TEST GROUP 1: Security Headers ──────────────────────────────────────────
  console.log('\n--- 1. Security Headers Verification ---');
  const healthRes = await request({ path: '/api/health', method: 'GET' });
  assertTest('X-Content-Type-Options: nosniff header present', healthRes.headers['x-content-type-options'] === 'nosniff');
  assertTest('X-Frame-Options: DENY clickjacking protection present', healthRes.headers['x-frame-options'] === 'DENY');
  assertTest('X-Powered-By header disabled/hidden', !healthRes.headers['x-powered-by']);
  assertTest('Content-Security-Policy header present', !!healthRes.headers['content-security-policy']);
  assertTest('Health check response sanitized', healthRes.body.status === 'healthy' && !healthRes.body.timestamp);

  // ── TEST GROUP 2: Authentication on State-Changing Room Routes ───────────────
  console.log('\n--- 2. Unauthenticated Access Protection ---');
  const unauthRoomPost = await request(
    { path: '/api/rooms', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { roomNumber: '999', type: 'Deluxe', price: 200 }
  );
  assertTest('Unauthenticated POST /api/rooms rejected with 401', unauthRoomPost.statusCode === 401);

  const unauthRoomPut = await request(
    { path: '/api/rooms/rm-101', method: 'PUT', headers: { 'Content-Type': 'application/json' } },
    { price: 999 }
  );
  assertTest('Unauthenticated PUT /api/rooms/:id rejected with 401', unauthRoomPut.statusCode === 401);

  const unauthRoomDelete = await request({ path: '/api/rooms/rm-101', method: 'DELETE' });
  assertTest('Unauthenticated DELETE /api/rooms/:id rejected with 401', unauthRoomDelete.statusCode === 401);

  // ── TEST GROUP 3: Authorization & Role Enforcement ──────────────────────────
  console.log('\n--- 3. Role-Based Access Control (RBAC) ---');
  const custCustomerList = await request({
    path: '/api/customers',
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assertTest('Customer role forbidden from GET /api/customers (403)', custCustomerList.statusCode === 403);

  const custInvoiceList = await request({
    path: '/api/invoices',
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assertTest('Customer role forbidden from GET /api/invoices (403)', custInvoiceList.statusCode === 403);

  const custUserList = await request({
    path: '/api/users',
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assertTest('Customer role forbidden from GET /api/users (403)', custUserList.statusCode === 403);

  const custReportsLogs = await request({
    path: '/api/reports/logs',
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assertTest('Customer role forbidden from GET /api/reports/logs (403)', custReportsLogs.statusCode === 403);

  const custRoomCreate = await request(
    { path: '/api/rooms', method: 'POST', headers: { Authorization: `Bearer ${customerToken}`, 'Content-Type': 'application/json' } },
    { roomNumber: '999', type: 'Deluxe', price: 200 }
  );
  assertTest('Customer role forbidden from POST /api/rooms (403)', custRoomCreate.statusCode === 403);

  // ── TEST GROUP 4: Type Validation & Injection Defense ───────────────────────
  console.log('\n--- 4. Input Type Validation & Non-String Rejection ---');
  const invalidLoginTypes = await request(
    { path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: { $ne: null }, password: 12345 }
  );
  assertTest('Non-string object email in login rejected with 400', invalidLoginTypes.statusCode === 400);

  const invalidRegisterTypes = await request(
    { path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: ['Alexander'], email: 'test@example.com', password: {} }
  );
  assertTest('Non-string payload in register rejected with 400', invalidRegisterTypes.statusCode === 400);

  const shortPasswordRegister = await request(
    { path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { name: 'Weak Pass User', email: 'weak@example.com', password: '123' }
  );
  assertTest('Weak password (< 12 chars / missing complexity) in register rejected with 400', shortPasswordRegister.statusCode === 400);

  // ── TEST GROUP 5: Reservation Status Enum Whitelisting ──────────────────────
  console.log('\n--- 5. Reservation Status Whitelist Validation ---');
  const invalidStatusUpdate = await request(
    {
      path: '/api/reservations/bk-test/status',
      method: 'PUT',
      headers: { Authorization: `Bearer ${managerToken}`, 'Content-Type': 'application/json' }
    },
    { status: 'injected_malicious_status' }
  );
  assertTest('Invalid reservation status rejected with 400', invalidStatusUpdate.statusCode === 400);

  // ── TEST GROUP 6: Business Rule & Numeric Boundaries ────────────────────────
  console.log('\n--- 6. Business Rules & Numeric Bounds ---');
  const invalidDatesBooking = await request(
    { path: '/api/reservations', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    {
      name: 'Guest',
      email: 'guest@test.com',
      phone: '1234567890',
      checkIn: '2026-10-10',
      checkOut: '2026-10-05', // checkOut before checkIn
      guests: 2
    }
  );
  assertTest('Check-out before check-in rejected with 400', invalidDatesBooking.statusCode === 400);

  const invalidGuestsBooking = await request(
    { path: '/api/reservations', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    {
      name: 'Guest',
      email: 'guest@test.com',
      phone: '1234567890',
      checkIn: '2026-10-10',
      checkOut: '2026-10-15',
      guests: -5 // negative guests
    }
  );
  assertTest('Negative guest count rejected with 400', invalidGuestsBooking.statusCode === 400);

  const invalidPriceBooking = await request(
    { path: '/api/reservations', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    {
      name: 'Guest',
      email: 'guest@test.com',
      phone: '1234567890',
      checkIn: '2026-10-10',
      checkOut: '2026-10-15',
      guests: 2,
      totalPrice: -100 // negative price
    }
  );
  assertTest('Negative total price rejected with 400', invalidPriceBooking.statusCode === 400);

  // ── TEST GROUP 7: Authentication Rate Limiting ──────────────────────────────
  console.log('\n--- 7. Authentication Rate Limiting (5 reqs / 30m) ---');
  let rateLimited = false;
  for (let i = 0; i < 7; i++) {
    const res = await request(
      { path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: `brute_test_${i}@example.com`, password: 'WrongPassword123!' }
    );
    if (res.statusCode === 429) {
      rateLimited = true;
      break;
    }
  }
  assertTest('Rate limiter triggered with HTTP 429 after 5 requests', rateLimited);

  console.log('\n======================================================');
  console.log(`  SUMMARY: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('======================================================\n');

  return passed === total;
}

// Start temporary test server
server = app.listen(PORT, '127.0.0.1', async () => {
  try {
    const success = await runSecurityTests();
    server.close(() => {
      process.exit(success ? 0 : 1);
    });
  } catch (err) {
    console.error('Test execution error:', err);
    server.close(() => {
      process.exit(1);
    });
  }
});
