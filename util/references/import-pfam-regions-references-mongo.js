// node util/references/import-pfam-regions-references-mongo.js
/* eslint-disable no-unused-vars */
const fs = require('fs')
const path = require('path')
const csv = require('fast-csv')
const _ = require('lodash')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
const { MongoClient, ObjectID } = require('mongodb')
const logger = require('../../src/logger')
// parse arguments
const argv = require('minimist')(process.argv.slice(2), {
  default: {
    mongodb: process.env.MONGODB,
    refName: 'pfam32',
    // regionsTsv: 'D:/pfam/Pfam32.0/Pfam-A.regions.uniprot.tsv',
    regionsTsv: '/home/hotdogee/datasets3/Pfam32.0/Pfam-A.regions.uniprot.tsv',
    service: 'references'
  }
})

/* eslint-enables no-unused-vars */
;(async () => {
  try {
    const client = await MongoClient.connect(argv.mongodb, {
      useNewUrlParser: true
    })
    const db = client.db()
    const collection = await db.collection(argv.service, {})
    // const result = await collection.updateOne(
    //   { _id: new ObjectID(userId) },
    //   { $addToSet: { authorizations: { org: argv.org, role: argv.role } } }
    // )
    // logger.info(`${argv.service}.updateOne`, { result })
    // const result = {
    //   result: { n: 1, nModified: 1, ok: 1 },
    //   connection: { id: 0, host: 'localhost', port: 27017 },
    //   modifiedCount: 1,
    //   upsertedId: null,
    //   upsertedCount: 0,
    //   matchedCount: 1,
    // }
    let ops = []
    const promises = []
    const batchSize = 1000000
    let finishedBatches = 0
    const stream = fs
      .createReadStream(argv.regionsTsv)
      .pipe(csv.parse({ delimiter: '\t', headers: true }))
      .on('error', (error) => logger.error(error))
      .on('data', (row) => {
        // logger.info(`ROW=${JSON.stringify(row)}`)
        // count += 1
        // if (count > 10) stream.destroy()
        const op = {
          insertOne: {
            document: {
              // seqAcc - String - UniProtKB Accession
              // refName - String - ‘pfam32’
              // pfamAcc - String - Pfam Accession
              // start - Integer - 1 indexed inclusive
              // end - Integer - 1 indexed inclusive
              seqAcc: `${row.uniprot_acc}.${row.seq_version}`,
              refName: argv.refName,
              pfamAcc: row.pfamA_acc,
              start: parseInt(row.seq_start),
              end: parseInt(row.seq_end)
            }
          }
        }
        ops.push(op)
        if (ops.length >= batchSize) {
          const promise = collection.bulkWrite(ops).then((result) => {
            // logger.info(JSON.stringify(result, null, 2))
            finishedBatches++
            logger.info(`finished: ${finishedBatches * batchSize}`)
          })
          promises.push(promise)
          ops = []
        }
      })
      .on('end', (rowCount) => {
        if (!_.isEmpty(ops)) {
          const promise = collection.bulkWrite(ops).then((result) => {
            // logger.info(JSON.stringify(result, null, 2))
            finishedBatches++
            logger.info(`finished: ${finishedBatches * batchSize}`)
          })
          promises.push(promise)
        }
        Promise.all(promises).then(async (results) => {
          logger.info('All done')
          await client.close()
          process.exit()
        })
        logger.info(`Parsed ${rowCount} rows`)
      })
  } catch (error) {
    logger.error(error)
  }
})()
