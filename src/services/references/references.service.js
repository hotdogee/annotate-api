// Initializes the `references` service on path `/references`
const { References } = require('./references.class')
const hooks = require('./references.hooks')

module.exports = function (app) {
  const paginate = app.get('paginate')

  const options = {
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/references', new References(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('references')

  service.hooks(hooks)
}
