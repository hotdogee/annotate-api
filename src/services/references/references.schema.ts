// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ReferencesService } from './references.class'

// Main data model schema
export const referencesSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    seqAcc: Type.String(),
    refName: Type.String(),
    pfamAcc: Type.String(),
    start: Type.Number(),
    end: Type.Number(),
    pfamId: Type.String(),
    pfamDesc: Type.String(),
    clanAcc: Type.String(),
    clanId: Type.String(),
  },
  { $id: 'References', additionalProperties: false },
)
export type References = Static<typeof referencesSchema>
export const referencesValidator = getValidator(referencesSchema, dataValidator)
export const referencesResolver = resolve<References, HookContext<ReferencesService>>({})

export const referencesExternalResolver = resolve<References, HookContext<ReferencesService>>({})

// Schema for creating new entries
export const referencesDataSchema = Type.Pick(
  referencesSchema,
  ['seqAcc', 'refName', 'pfamAcc', 'start', 'end'],
  {
    $id: 'ReferencesData',
  },
)
export type ReferencesData = Static<typeof referencesDataSchema>
export const referencesDataValidator = getValidator(referencesDataSchema, dataValidator)
export const referencesDataResolver = resolve<References, HookContext<ReferencesService>>({})

// Schema for updating existing entries
export const referencesPatchSchema = Type.Partial(referencesSchema, {
  $id: 'ReferencesPatch',
})
export type ReferencesPatch = Static<typeof referencesPatchSchema>
export const referencesPatchValidator = getValidator(referencesPatchSchema, dataValidator)
export const referencesPatchResolver = resolve<References, HookContext<ReferencesService>>({})

// Schema for allowed query properties
export const referencesQueryProperties = Type.Pick(referencesSchema, [
  '_id',
  'seqAcc',
  'refName',
  'pfamAcc',
  'start',
  'end',
])
export const referencesQuerySchema = Type.Intersect(
  [
    querySyntax(referencesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type ReferencesQuery = Static<typeof referencesQuerySchema>
export const referencesQueryValidator = getValidator(referencesQuerySchema, queryValidator)
export const referencesQueryResolver = resolve<ReferencesQuery, HookContext<ReferencesService>>({})
