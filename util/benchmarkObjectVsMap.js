const logger = require('./logger')

/**
 * Benchmarks performance of Object vs Map for common operations
 * @param {number} iterations - Number of operations to perform
 * @returns {Object} Object containing benchmark results
 */
function benchmarkObjectVsMap(iterations = 1000000) {
  // Object operations
  const objSetStart = performance.now()
  const obj = {}
  for (let i = 0; i < iterations; i++) {
    obj[`key${i}`] = i
  }
  const objSetEnd = performance.now()
  const objSetTime = Math.floor(objSetEnd - objSetStart)

  const objUpdateStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    obj[`key${i}`] = i + 1
  }
  const objUpdateEnd = performance.now()
  const objUpdateTime = Math.floor(objUpdateEnd - objUpdateStart)

  const objGetStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    const val = obj[`key${i}`]
  }
  const objGetEnd = performance.now()
  const objGetTime = Math.floor(objGetEnd - objGetStart)

  const objDeleteStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    delete obj[`key${i}`]
  }
  const objDeleteEnd = performance.now()
  const objDeleteTime = Math.floor(objDeleteEnd - objDeleteStart)

  // Map operations
  const mapSetStart = performance.now()
  const map = new Map()
  for (let i = 0; i < iterations; i++) {
    map.set(`key${i}`, i)
    // map[`key${i}`] = i
  }
  const mapSetEnd = performance.now()
  const mapSetTime = Math.floor(mapSetEnd - mapSetStart)

  const mapUpdateStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    map.set(`key${i}`, i + 1)
    // map[`key${i}`] = i + 1
  }
  const mapUpdateEnd = performance.now()
  const mapUpdateTime = Math.floor(mapUpdateEnd - mapUpdateStart)

  const mapGetStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    const val = map.get(`key${i}`)
    // const val = map[`key${i}`]
  }
  const mapGetEnd = performance.now()
  const mapGetTime = Math.floor(mapGetEnd - mapGetStart)

  const mapDeleteStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    map.delete(`key${i}`)
    // delete map[`key${i}`]
  }
  const mapDeleteEnd = performance.now()
  const mapDeleteTime = Math.floor(mapDeleteEnd - mapDeleteStart)

  // Output results
  console.log(`Object Set Took: ${objSetTime}`)
  console.log(`Object Update Took: ${objUpdateTime}`)
  console.log(`Object Get Took: ${objGetTime}`)
  console.log(`Object Delete Took: ${objDeleteTime}`)
  console.log(`Map Set Took: ${mapSetTime}`)
  console.log(`Map Update Took: ${mapUpdateTime}`)
  console.log(`Map Get Took: ${mapGetTime}`)
  console.log(`Map Delete Took: ${mapDeleteTime}`)

  // Log using Winston logger if needed
  logger.info(`Completed benchmark with ${iterations} iterations`)

  // Return results for potential programmatic use
  return {
    object: {
      set: objSetTime,
      update: objUpdateTime,
      get: objGetTime,
      delete: objDeleteTime,
    },
    map: {
      set: mapSetTime,
      update: mapUpdateTime,
      get: mapGetTime,
      delete: mapDeleteTime,
    },
  }
}

module.exports = benchmarkObjectVsMap

// Node v22 Results
// Performance Comparison (Object time / Map time):
// Set: 1.49x (Map is faster)
// Update: 1.11x (Map is faster)
// Get: 1.17x (Map is faster)
// Delete: 1.47x (Map is faster)

//  Also, map methods are faster.
