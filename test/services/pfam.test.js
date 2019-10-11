const assert = require('assert')
const app = require('../../src/app')

describe("'pfam' service", () => {
  it('registered the service', () => {
    const service = app.service('pfam')

    assert.ok(service, 'Registered the service')
  })
})
