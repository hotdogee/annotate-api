const pfam = require('./pfam/pfam.service.js')
const references = require('./references/references.service.js')
// eslint-disable-next-line no-unused-vars
module.exports = function(app) {
  app.configure(pfam)
  app.configure(references)
}
