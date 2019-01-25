const logger = require('./logger')
const pfam = require('./pfam')

// async main
;(async () => {
  try {
    const result = await pfam.remove(null)
    logger.info(JSON.stringify(result, null, 0))
  } catch (error) {
    logger.error(error)
  } finally {
    process.exit()
  }
})()
