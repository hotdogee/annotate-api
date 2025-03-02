/**
 * Example client for the Pfam API
 *
 * This example demonstrates how to:
 * 1. Send a protein sequence to the API
 * 2. Receive and process the prediction results
 * 3. Demonstrate caching functionality with repeated requests
 *
 * Usage:
 * node examples/pfam-client.js
 */

const axios = require('axios')

// Example protein sequence (insulin)
const proteinSequence =
  'MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN'

// API endpoint
const apiUrl = 'http://localhost:3030/pfam'

// Function to measure execution time
const measureTime = async fn => {
  const start = Date.now()
  const result = await fn()
  const end = Date.now()
  return { result, executionTime: end - start }
}

async function predictProteinFunction() {
  try {
    console.log('First request - should call the TensorFlow Serving API:')
    console.log('Sending protein sequence to API...')

    // First request - should call the TensorFlow Serving API
    const { result: response1, executionTime: time1 } = await measureTime(async () => {
      return await axios.post(apiUrl, {
        sequence: proteinSequence
      })
    })

    // Process the response
    console.log(`Prediction successful! (took ${time1}ms)`)
    console.log('Record ID:', response1.data._id)
    console.log('Sequence:', response1.data.sequence)
    console.log('Created at:', new Date(response1.data.createdAt).toLocaleString())

    // Display prediction results
    const predictions = response1.data.predictions
    if (predictions) {
      console.log('\nPrediction Results:')
      console.log(`Total classes predicted: ${predictions.classes.length}`)

      // Display the first 5 predictions
      console.log('\nFirst 5 predictions:')
      for (let i = 0; i < 5; i++) {
        console.log(`Position ${i + 1}:`)
        console.log(`  Class: ${predictions.classes[i]}`)
        console.log(`  Top classes: ${predictions.top_classes[i].join(', ')}`)
        console.log(`  Top probabilities: ${predictions.top_probs[i].map(p => p.toFixed(6)).join(', ')}`)
      }
    }

    // Second request with the same sequence - should use cache
    console.log('\n\nSecond request - should use cache:')
    console.log('Sending the same protein sequence to API...')

    const { result: response2, executionTime: time2 } = await measureTime(async () => {
      return await axios.post(apiUrl, {
        sequence: proteinSequence
      })
    })

    console.log(`Prediction successful! (took ${time2}ms)`)
    console.log('Record ID:', response2.data._id)

    // Compare execution times
    console.log('\nPerformance comparison:')
    console.log(`First request (API call): ${time1}ms`)
    console.log(`Second request (cached): ${time2}ms`)
    console.log(`Speed improvement: ${(time1 / time2).toFixed(2)}x faster`)

    // Verify both responses have the same ID (hash)
    console.log('\nCache validation:')
    console.log(`Same record ID: ${response1.data._id === response2.data._id ? 'Yes' : 'No'}`)
  } catch (error) {
    console.error('Error predicting protein function:')
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server')
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message)
    }
  }
}

// Run the example
predictProteinFunction()
