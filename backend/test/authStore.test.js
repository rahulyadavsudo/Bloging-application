const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createUserStore } = require('../src/models/authStore');

test('register and verify a user', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'authstore-'));
  const store = createUserStore(path.join(tempDir, 'users.json'));

  const registered = await store.registerUser({ username: 'ada', password: 'secret123' });
  assert.equal(registered.username, 'ada');

  const verified = await store.verifyUser({ username: 'ada', password: 'secret123' });
  assert.equal(verified.username, 'ada');
});
