import assert from 'assert'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { app } from '../../../src/app'
import { generateSequenceHash } from '../../../src/services/pfam/pfam.schema'

// Define the interface for the domain map entry
interface DomainMapEntry {
  pfamAcc: string
  pfamId: string
  pfamDesc: string
  clanAcc: string
  clanId: string
}

// Define the expected data structure
interface ExpectedData {
  _id: string
  sequence: string
  createdAt: number
  predictions: {
    top_classes: number[][]
    top_probs: number[][]
    classes: number[]
  }
  domainMap: {
    [key: string]: DomainMapEntry
  }
}

describe('Pfam service', () => {
  // Load the expected test data from pfam-expected.json
  const expectedDataPath = path.join(__dirname, 'pfam-expected.json')
  const expectedData = JSON.parse(fs.readFileSync(expectedDataPath, 'utf8')) as ExpectedData

  it('registered the service', () => {
    const service = app.service('pfam')
    assert.ok(service, 'Registered the service')
  })

  it('creates a pfam prediction and uses cache for repeated requests', async () => {
    // Save the original axios.post method
    const originalPost = axios.post

    // Create a mock implementation with a counter to track calls
    let apiCallCount = 0
    // @ts-ignore - Ignoring type issues with the mock
    axios.post = function mockPost() {
      apiCallCount++
      return Promise.resolve({
        data: {
          predictions: [
            {
              classes: expectedData.predictions.classes,
              top_classes: expectedData.predictions.top_classes,
              top_probs: expectedData.predictions.top_probs,
            },
          ],
        },
      })
    }

    const testSequence = expectedData.sequence
    const expectedHash = generateSequenceHash(testSequence)

    try {
      // First request - should call the API
      const result1 = await app.service('pfam').create({
        sequence: testSequence,
      })

      // Verify the result
      assert.ok(result1._id, 'Created record has an _id')
      assert.equal(result1._id, expectedHash, 'ID is the hash of the sequence')
      assert.equal(result1.sequence, testSequence, 'Sequence was saved')
      assert.ok(result1.predictions, 'Predictions were saved')
      assert.equal(apiCallCount, 1, 'API was called once')

      // Check that domainMap exists and has the right structure
      assert.ok(result1.domainMap, 'Domain map was added to the result')

      // Verify the domainMap contains the expected domain entries
      // Get unique class IDs from top_classes
      const uniqueClassIds = new Set<string>()
      for (const classArray of result1.predictions.top_classes) {
        for (const classId of classArray) {
          uniqueClassIds.add(classId.toString())
        }
      }

      // Check that all class IDs from top_classes are in the domainMap
      for (const classId of uniqueClassIds) {
        assert.ok(result1.domainMap[classId], `Domain map has entry for class ID ${classId}`)

        // If this class ID is in the expected data, verify it matches
        if (expectedData.domainMap[classId]) {
          assert.deepStrictEqual(
            result1.domainMap[classId],
            expectedData.domainMap[classId],
            `Domain map entry for class ID ${classId} matches expected data`,
          )
        }
      }

      // Verify special class 1 (NO_DOMAIN) is included
      assert.deepStrictEqual(
        result1.domainMap['1'],
        {
          pfamAcc: 'NO_DOMAIN',
          pfamId: 'NO_DOMAIN',
          pfamDesc: 'No Domain',
          clanAcc: '',
          clanId: '',
        },
        'Domain map includes NO_DOMAIN entry for class 1',
      )

      // Second request with the same sequence - should use cache
      const result2 = await app.service('pfam').create({
        sequence: testSequence,
      })

      // Verify the result
      assert.ok(result2._id, 'Created record has an _id')
      assert.equal(result2._id, expectedHash, 'ID is the hash of the sequence')
      assert.equal(result2.sequence, testSequence, 'Sequence was saved')
      assert.ok(result2.predictions, 'Predictions were saved')
      assert.ok(result2.domainMap, 'Domain map was added to the result')
      assert.equal(apiCallCount, 1, 'API was not called again')

      // Verify both results are the same
      assert.deepStrictEqual(result1, result2, 'Both results are identical')

      // Verify the result structure matches the expected data
      // Note: We don't compare _id directly as it's based on the hash of the sequence
      // and the test sequence might not match the expected data exactly
      assert.deepStrictEqual(
        result1.predictions,
        expectedData.predictions,
        'Predictions match the expected data',
      )

      // Compare domainMap structures to ensure all expected domains are present
      for (const classId in expectedData.domainMap) {
        assert.deepStrictEqual(
          result1.domainMap[classId],
          expectedData.domainMap[classId],
          `Domain map entry for class ID ${classId} matches expected data`,
        )
      }
    } finally {
      // Restore the original axios.post
      axios.post = originalPost

      // Clean up the test data
      try {
        await app.service('pfam').remove(expectedHash)
      } catch (error) {
        console.log('Error cleaning up test data:', error)
      }
    }
  })

  it('creates a pfam prediction with real API call and matches expected data', async () => {
    const testSequence = expectedData.sequence
    const expectedHash = generateSequenceHash(testSequence)

    try {
      // Clean up any existing test data before starting
      try {
        await app.service('pfam')._remove(expectedHash)
      } catch (error) {
        // Ignore errors if the record doesn't exist
      }

      // Make a real API call to the pfam service
      const result = await app.service('pfam').create({
        sequence: testSequence,
      })

      // Verify the result has the expected structure
      assert.ok(result._id, 'Created record has an _id')
      assert.equal(result._id, expectedHash, 'ID is the hash of the sequence')
      assert.equal(result.sequence, testSequence, 'Sequence was saved')
      assert.ok(result.predictions, 'Predictions were saved')
      assert.ok(result.domainMap, 'Domain map was added to the result')

      // Verify the predictions match the expected data
      // assert.deepStrictEqual(
      //   result.predictions,
      //   expectedData.predictions[0],
      //   'Predictions match the expected data',
      // )

      // Verify the domainMap contains all expected entries
      for (const classId in expectedData.domainMap) {
        assert.deepStrictEqual(
          result.domainMap[classId],
          expectedData.domainMap[classId],
          `Domain map entry for class ID ${classId} matches expected data`,
        )
      }

      // Verify all class IDs from top_classes are in the domainMap
      const uniqueClassIds = new Set<string>()
      for (const classArray of result.predictions.top_classes) {
        for (const classId of classArray) {
          uniqueClassIds.add(classId.toString())
        }
      }

      for (const classId of uniqueClassIds) {
        assert.ok(result.domainMap[classId], `Domain map has entry for class ID ${classId}`)
      }

      // Verify special class 1 (NO_DOMAIN) is included
      assert.deepStrictEqual(
        result.domainMap['1'],
        {
          pfamAcc: 'NO_DOMAIN',
          pfamId: 'NO_DOMAIN',
          pfamDesc: 'No Domain',
          clanAcc: '',
          clanId: '',
        },
        'Domain map includes NO_DOMAIN entry for class 1',
      )
    } finally {
      // Clean up the test data
      try {
        await app.service('pfam').remove(expectedHash)
      } catch (error) {
        console.log('Error cleaning up test data:', error)
      }
    }
  })
})
