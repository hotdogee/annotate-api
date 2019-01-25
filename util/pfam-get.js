const logger = require('./logger')
const pfam = require('./pfam')

// async main
;(async () => {
  try {
    const id = 'c5179bf95c52872dd0be1207dd9898dc'
    const result = await pfam.get(id)
    // const result = await pfam.find({
    //   query: {
    //     _id: 'c5179bf95c52872dd0be1207dd9898dc'
    //   }
    // })
    logger.info(result)
  } catch (error) {
    logger.error(error)
  } finally {
    process.exit()
  }
})()
