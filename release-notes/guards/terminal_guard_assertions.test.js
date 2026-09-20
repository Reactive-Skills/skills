const assert = require('node:assert/strict');
const { test } = require('node:test');

const guards = {
  success: (payload) => payload.approved === true,
  blocked: (payload) => payload.rejected === true,
  error: (payload) => payload.exit_code !== 0
};

test('SUCCESS guard accepts approval and rejects invalid payloads', () => {
  assert.equal(guards.success({ approved: true }), true);
  assert.equal(guards.success({ approved: false }), false);
  assert.equal(guards.success({}), false);
});

test('BLOCKED guard accepts rejection and rejects invalid payloads', () => {
  assert.equal(guards.blocked({ rejected: true }), true);
  assert.equal(guards.blocked({ rejected: false }), false);
  assert.equal(guards.blocked({}), false);
});

test('ERROR guard accepts failure and rejects success payloads', () => {
  assert.equal(guards.error({ exit_code: 1 }), true);
  assert.equal(guards.error({ exit_code: 0 }), false);
  assert.equal(guards.error({}), true);
});
