// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { createHash } from 'crypto'
import axios from 'axios'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { PfamService } from './pfam.class'
import path from 'path'
import fs from 'fs'
// Load domain list from the meta file
let domainList: string[] = []
let pfamAClansMap: Map<
  string,
  { pfamId: string; pfamDesc: string; clanAcc: string; clanId: string }
> = new Map()

// Function to load the domain list and Pfam clans data
const loadDomainData = () => {
  try {
    // Load domain_list from pfam-regions-d0-s20-meta.json
    const metaPath = path.join(__dirname, '../../assets/pfam-regions-d0-s20-meta.json')
    const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
    domainList = metaData.domain_list

    // Load Pfam-A.clans.tsv data
    const pfamAClansTsvPath = path.join(__dirname, '../../assets/Pfam-A.clans.tsv')
    pfamAClansMap = fs
      .readFileSync(pfamAClansTsvPath, 'utf8')
      .trim()
      .split('\n')
      .reduce((map, row) => {
        const columns = row.split('\t').map((value) => value.trim())
        map.set(columns[0], {
          clanAcc: columns[1],
          clanId: columns[2],
          pfamId: columns[3],
          pfamDesc: columns[4],
        })
        return map
      }, pfamAClansMap)

    // Add the special classes to the map
    // "PAD",
    // "NO_DOMAIN",
    // "UNKNOWN_DOMAIN",
    pfamAClansMap.set('PAD', {
      clanAcc: '',
      clanId: '',
      pfamId: 'PAD',
      pfamDesc: 'Sequence Padding',
    })
    pfamAClansMap.set('NO_DOMAIN', {
      clanAcc: '',
      clanId: '',
      pfamId: 'NO_DOMAIN',
      pfamDesc: 'No Domain',
    })
    pfamAClansMap.set('UNKNOWN_DOMAIN', {
      clanAcc: '',
      clanId: '',
      pfamId: 'UNKNOWN_DOMAIN',
      pfamDesc: 'Unknown Domain',
    })
    // Note: 'PF05906' does not exist in domainList
    console.log(`Loaded ${domainList.length} domains and ${pfamAClansMap.size} Pfam entries`)
  } catch (error) {
    console.error('Error loading domain data:', error)
  }
}

// Load the domain data
if (domainList.length === 0 || pfamAClansMap.size === 0) {
  loadDomainData()
}

// Function to generate a hash from a protein sequence
export const generateSequenceHash = (
  sequence: string,
  model = 'pfam',
  version = '1568346315',
): string => {
  return createHash('sha256')
    .update(sequence + model + version)
    .digest('hex')
}

// Domain map schema
const domainEntrySchema = Type.Object({
  pfamAcc: Type.String(),
  pfamId: Type.String(),
  pfamDesc: Type.String(),
  clanAcc: Type.String(),
  clanId: Type.String(),
})
export type DomainEntry = Static<typeof domainEntrySchema>

// Main data model schema
export const pfamSchema = Type.Object(
  {
    _id: Type.String(),
    sequence: Type.String(),
    createdAt: Type.Number(),
    predictions: Type.Optional(
      Type.Object({
        classes: Type.Array(Type.Number()),
        top_classes: Type.Array(Type.Array(Type.Number())),
        top_probs: Type.Array(Type.Array(Type.Number())),
      }),
    ),
    domainMap: Type.Optional(Type.Record(Type.String(), domainEntrySchema)),
  },
  { $id: 'Pfam', additionalProperties: false },
)
export type Pfam = Static<typeof pfamSchema>
export const pfamValidator = getValidator(pfamSchema, dataValidator)
// This resolver handles data being returned from the database.
// This is where you would fetch associated data or transform results.
export const pfamResolver = resolve<Pfam, HookContext<PfamService>>({
  domainMap: virtual((pfam, context) => {
    // If domain data isn't loaded yet, load it
    if (domainList.length === 0 || pfamAClansMap.size === 0) {
      loadDomainData()
    }
    // Skip if no predictions
    if (!pfam.predictions) {
      return {}
    }

    // Create a domainMap to hold the mappings
    const domainMap: Record<string, DomainEntry> = {}
    new Set<number>(pfam.predictions.top_classes.flat()).forEach((classIndex) => {
      const pfamAcc = domainList[classIndex]
      const pfamInfo = pfamAClansMap.get(pfamAcc) || {
        clanAcc: '',
        clanId: '',
        pfamId: '',
        pfamDesc: '',
      }
      domainMap[classIndex] = {
        pfamAcc,
        pfamId: pfamInfo.pfamId,
        pfamDesc: pfamInfo.pfamDesc,
        clanAcc: pfamInfo.clanAcc,
        clanId: pfamInfo.clanId,
      }
    })

    return domainMap
  }),
})

// This resolver defines what data is sent to clients, often used to hide sensitive information.
// Returns a safe version of the data that can be sent to external clients, often used to hide protected properties.
export const pfamExternalResolver = resolve<Pfam, HookContext<PfamService>>({})

// Schema for creating new entries
export const pfamDataSchema = Type.Pick(pfamSchema, ['sequence'], {
  $id: 'PfamData',
})
export type PfamData = Static<typeof pfamDataSchema>
export const pfamDataValidator = getValidator(pfamDataSchema, dataValidator)
// This resolver handles incoming data for create operations.
// Can add/replace default or calculated values before saving to the database.
export const pfamDataResolver = resolve<Pfam, HookContext<PfamService>>({
  _id: async (value, pfam, context) => {
    // Generate a hash from the sequence to use as the _id
    if (pfam.sequence) {
      return generateSequenceHash(pfam.sequence)
    }
    return value
  },
  createdAt: async () => Date.now(),
  predictions: async (value, pfam, context) => {
    // Return existing value if it's already set or if there's no sequence
    if (value !== undefined || !pfam.sequence || context.result) {
      return value
    }

    try {
      // Call the TensorFlow Serving API
      console.log('Calling TensorFlow Serving API')
      const response = await axios.post(`${context.app.get('servingUrl')}/pfam:predict`, {
        instances: [pfam.sequence],
      })

      // Extract and return the predictions from the response
      return response.data.predictions[0]
    } catch (error) {
      console.error('Error calling TensorFlow Serving API:', error)
      throw error
    }
  },
})

// Schema for updating existing entries
export const pfamPatchSchema = Type.Partial(pfamSchema, {
  $id: 'PfamPatch',
})
export type PfamPatch = Static<typeof pfamPatchSchema>
export const pfamPatchValidator = getValidator(pfamPatchSchema, dataValidator)
// This resolver handles incoming data for patch operations.
// Can add/replace default or calculated values before saving to the database.
export const pfamPatchResolver = resolve<Pfam, HookContext<PfamService>>({})

// Schema for allowed query properties
export const pfamQueryProperties = Type.Pick(pfamSchema, ['_id', 'sequence'])
export const pfamQuerySchema = Type.Intersect(
  [
    querySyntax(pfamQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type PfamQuery = Static<typeof pfamQuerySchema>
export const pfamQueryValidator = getValidator(pfamQuerySchema, queryValidator)
// This resolver validates and modifies query parameters, often used for security.
// Can be used for additional limitations like only allowing a user to see their own data.
export const pfamQueryResolver = resolve<PfamQuery, HookContext<PfamService>>({})
// Resolvers can be used to:
// 1. Populate related data
// 2. Transform data for display
// 3. Hide sensitive information
// 4. Set default values
// 5. Enforce security rules
// 6. Sanitize input
// 7. Add computed properties
