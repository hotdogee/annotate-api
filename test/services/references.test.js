const assert = require('assert');
const app = require('../../src/app');

describe('\'references\' service', () => {
  it('registered the service', () => {
    const service = app.service('references');

    assert.ok(service, 'Registered the service');
  });
});
