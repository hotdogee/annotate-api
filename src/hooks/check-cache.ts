// For more information about hooks see: https://dove.feathersjs.com/guides/cli/hooks.html
import type { HookContext } from '@feathersjs/feathers'
import { generateSequenceHash } from '../services/pfam/pfam.schema'

/**
 * Hook that checks if a sequence is already cached in the database
 * If found, it sets the result and skips the service method
 * If not found, it sets the _id on the data to the sequence hash
 */
export const checkCache = async (context: HookContext) => {
  if (!context.data || !context.data.sequence) {
    return context
  }

  // Generate hash for the sequence
  const sequenceHash = generateSequenceHash(context.data.sequence)

  try {
    // Check if we already have this sequence in the database
    const existingRecord = await context.service._get(sequenceHash)
    console.log(`Cache hit for sequence hash: ${sequenceHash}`)
    // prefer user supplied header
    if (context.data.header) {
      existingRecord.header = context.data.header
    }
    // Skip the rest of the hooks and the service method by setting context.result
    context.result = existingRecord
    return context
  } catch (error) {
    // Record not found, continue with service method
    console.log(`Cache miss for sequence hash: ${sequenceHash}, will call TensorFlow Serving API`)

    // Store the hash for use in the service method
    context.data._id = sequenceHash
    return context
  }
}
