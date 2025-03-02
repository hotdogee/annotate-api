import { MongoClient } from 'mongodb'

// Use require for CommonJS modules
const logger = require('../logger')
const config = require('config')

;(async () => {
  const client = await MongoClient.connect(config.get('mongodb'))
  try {
    const db = client.db()
    const collection = db.collection('references', {})
    const result = await collection.createIndexes([
      {
        // support queries on these field combinations:
        // - seqAcc
        // - seqAcc and refName
        key: { seqAcc: 1, refName: 1 },
        unique: false,
        background: true,
      },
    ])
    logger.info(`Indexes created: ${JSON.stringify(result, null, 2)}`)
  } catch (error) {
    logger.error('Error creating indexes:', error)
  } finally {
    logger.info('Closing MongoDB connection')
    await client.close()
    logger.info('Exiting script')
    process.exit(0)
  }
})()
