const benchmarkObjectVsMap = require('./benchmarkObjectVsMap')

/**
 * Runs the Object vs Map benchmark with the specified iterations
 */
function runBenchmark() {
  const args = process.argv.slice(2)
  const iterations = args[0] ? parseInt(args[0], 10) : 1000000

  console.log(`Running benchmark with ${iterations.toLocaleString()} iterations...\n`)

  const results = benchmarkObjectVsMap(iterations)

  console.log('\nBenchmark complete!')

  // Calculate performance differences
  const setDiff = Math.round((results.object.set / results.map.set) * 100) / 100
  const updateDiff = Math.round((results.object.update / results.map.update) * 100) / 100
  const getDiff = Math.round((results.object.get / results.map.get) * 100) / 100
  const deleteDiff = Math.round((results.object.delete / results.map.delete) * 100) / 100

  console.log('\nPerformance Comparison (Object time / Map time):')
  console.log(`Set: ${setDiff}x ${setDiff > 1 ? '(Map is faster)' : '(Object is faster)'}`)
  console.log(`Update: ${updateDiff}x ${updateDiff > 1 ? '(Map is faster)' : '(Object is faster)'}`)
  console.log(`Get: ${getDiff}x ${getDiff > 1 ? '(Map is faster)' : '(Object is faster)'}`)
  console.log(`Delete: ${deleteDiff}x ${deleteDiff > 1 ? '(Map is faster)' : '(Object is faster)'}`)
}

// Run the benchmark when this script is executed directly
if (require.main === module) {
  runBenchmark()
}

module.exports = runBenchmark
