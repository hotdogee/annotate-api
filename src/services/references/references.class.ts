// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  References,
  ReferencesData,
  ReferencesPatch,
  ReferencesQuery,
} from './references.schema'

export type { References, ReferencesData, ReferencesPatch, ReferencesQuery }

export interface ReferencesParams extends MongoDBAdapterParams<ReferencesQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ReferencesService<
  ServiceParams extends Params = ReferencesParams,
> extends MongoDBService<References, ReferencesData, ReferencesParams, ReferencesPatch> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('references')),
  }
}
