// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  References,
  ReferencesData,
  ReferencesPatch,
  ReferencesQuery,
  ReferencesService,
} from './references.class'

export type { References, ReferencesData, ReferencesPatch, ReferencesQuery }

export type ReferencesClientService = Pick<
  ReferencesService<Params<ReferencesQuery>>,
  (typeof referencesMethods)[number]
>

export const referencesPath = 'references'

export const referencesMethods: Array<keyof ReferencesService> = [
  'find',
  // 'get',
  // 'create',
  // 'patch',
  // 'remove',
]

export const referencesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(referencesPath, connection.service(referencesPath), {
    methods: referencesMethods,
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [referencesPath]: ReferencesClientService
  }
}
