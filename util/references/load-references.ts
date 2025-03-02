import * as fs from 'fs'
import * as path from 'path'
import * as csv from 'fast-csv'
import { MongoClient, ObjectId } from 'mongodb'

// Use require for CommonJS modules
const logger = require('../logger')
const config = require('config')
const _ = require('lodash')

const references = config.get('references')

function getAppRootDir() {
  let currentDir = __dirname
  while (!fs.existsSync(path.join(currentDir, 'package.json'))) {
    currentDir = path.join(currentDir, '..')
  }
  return currentDir
}

// Define interfaces for our data structures
interface ReferenceConfig {
  refName: string
  regionsTsv: string
}

interface PfamRow {
  uniprot_acc: string
  seq_version: string
  pfamA_acc: string
  seq_start: string
  seq_end: string
}

interface PfamDocument {
  seqAcc: string
  refName: string
  pfamAcc: string
  start: number
  end: number
}

type BulkOperation = {
  insertOne: {
    document: PfamDocument
  }
}

// Function to process a single reference file
function processReferenceFile(collection, refName: string, regionsTsvPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let ops: BulkOperation[] = []
    const promises: Promise<any>[] = []
    const batchSize = 1000000
    let finishedBatches = 0

    fs.createReadStream(regionsTsvPath)
      .pipe(csv.parse({ delimiter: '\t', headers: true }))
      .on('error', (error) => {
        logger.error(error)
        reject(error)
      })
      .on('data', (row: PfamRow) => {
        // logger.info(`ROW=${JSON.stringify(row)}`)
        // count += 1
        // if (count > 10) stream.destroy()
        const op: BulkOperation = {
          insertOne: {
            document: {
              // seqAcc - String - UniProtKB Accession
              // refName - String - 'pfam32'
              // pfamAcc - String - Pfam Accession
              // start - Integer - 1 indexed inclusive
              // end - Integer - 1 indexed inclusive
              seqAcc: `${row.uniprot_acc}.${row.seq_version}`,
              refName,
              pfamAcc: row.pfamA_acc,
              start: parseInt(row.seq_start),
              end: parseInt(row.seq_end),
            },
          },
        }
        ops.push(op)
        if (ops.length >= batchSize) {
          const promise = collection.bulkWrite(ops).then((result) => {
            // logger.info(JSON.stringify(result, null, 2))
            finishedBatches++
            logger.info(`finished: ${(finishedBatches * batchSize).toLocaleString()}`)
          })
          promises.push(promise)
          ops = []
        }
      })
      .on('end', async (rowCount) => {
        try {
          if (!_.isEmpty(ops)) {
            const promise = collection.bulkWrite(ops).then((result) => {
              // logger.info(JSON.stringify(result, null, 2))
              finishedBatches++
              logger.info(`finished: ${(finishedBatches * batchSize).toLocaleString()}`)
            })
            promises.push(promise)
          }
          await Promise.all(promises)
          logger.info(`Parsed ${rowCount} rows for ${refName}`)
          // Parsed 88761542 rows for pfam31
          // Parsed 138165283 rows for pfam32
          resolve()
        } catch (error) {
          reject(error)
        }
      })
  })
}

;(async () => {
  const client = await MongoClient.connect(config.get('mongodb'))
  try {
    const db = client.db()
    const collection = db.collection('references', {})
    // "references": [
    //   {
    //     "refName": "pfam31",
    //     "regionsTsv": "./reference-regions/Pfam31.0/Pfam-A.regions.uniprot.tsv"
    //   },
    //   {
    //     "refName": "pfam32",
    //     "regionsTsv": "./reference-regions/Pfam32.0/Pfam-A.regions.uniprot.tsv"
    //   }
    // ]
    // Process references sequentially
    for (const { refName, regionsTsv } of references as ReferenceConfig[]) {
      // Convert regionsTsv to absolute path
      const regionsTsvPath = path.resolve(getAppRootDir(), regionsTsv)
      logger.info(`Loading ${refName} from ${regionsTsvPath}`)

      // Wait for each file to complete processing before moving to the next
      await processReferenceFile(collection, refName, regionsTsvPath)
      logger.info(`Completed processing ${refName}`)
    }

    logger.info('All references processed successfully')
  } catch (error) {
    logger.error('Error processing references:', error)
  } finally {
    logger.info('Closing MongoDB connection')
    await client.close()
    logger.info('Exiting script')
    process.exit(0)
  }
})()
