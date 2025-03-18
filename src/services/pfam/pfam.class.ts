// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Pfam, PfamData, PfamPatch, PfamQuery } from './pfam.schema'

export type { Pfam, PfamData, PfamPatch, PfamQuery }

export interface PfamParams extends MongoDBAdapterParams<PfamQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class PfamService<ServiceParams extends Params = PfamParams> extends MongoDBService<
  Pfam,
  PfamData,
  PfamParams,
  PfamPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then(db => db.collection('pfam'))
  }
}
