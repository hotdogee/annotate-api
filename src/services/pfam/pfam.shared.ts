// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Pfam, PfamData, PfamPatch, PfamQuery, PfamService } from './pfam.class'

export type { Pfam, PfamData, PfamPatch, PfamQuery }

export type PfamClientService = Pick<PfamService<Params<PfamQuery>>, (typeof pfamMethods)[number]>

export const pfamPath = 'pfam'

export const pfamMethods: Array<keyof PfamService> = ['find', 'get', 'create', 'patch', 'remove']

export const pfamClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(pfamPath, connection.service(pfamPath), {
    methods: pfamMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [pfamPath]: PfamClientService
  }
}
