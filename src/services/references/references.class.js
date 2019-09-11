const { Service } = require('feathers-mongodb')

exports.References = class References extends Service {
  constructor (options, app) {
    super(options)

    app.get('mongoClient').then((db) => {
      this.Model = db.collection('references')
    })
  }
}
