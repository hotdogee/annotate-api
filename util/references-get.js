const logger = require('./logger')
const client = require('./client')

// async main
;(async () => {
  try {
    // Find references with seqAcc A0A103YDS2.1
    const result = await client.service('references').get('67c48570271270f15f5eb1ef')
    // Log the result
    logger.info(JSON.stringify(result, null, 2))
  } catch (error) {
    logger.error(error)
  } finally {
    process.exit()
  }
})()
