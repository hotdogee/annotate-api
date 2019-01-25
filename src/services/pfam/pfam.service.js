// Initializes the `pfam` service on path `/pfam`
const createService = require('feathers-mongodb')
const hooks = require('./pfam.hooks')

module.exports = function (app) {
  const paginate = app.get('paginate')
  const mongoClient = app.get('mongoClient')
  const options = { paginate, multi: [ 'remove' ] }

  // Initialize our service with any options it requires
  app.use('/pfam', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('pfam')

  mongoClient.then(db => {
    service.Model = db.collection('pfam')
  })

  service.hooks(hooks)
}
