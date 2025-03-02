// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  referencesDataValidator,
  referencesPatchValidator,
  referencesQueryValidator,
  referencesResolver,
  referencesExternalResolver,
  referencesDataResolver,
  referencesPatchResolver,
  referencesQueryResolver,
} from './references.schema'

import type { Application, HookContext } from '../../declarations'
import { ReferencesService, getOptions } from './references.class'
import { referencesPath, referencesMethods } from './references.shared'
import type { Paginated } from '@feathersjs/feathers'
import type { References } from './references.schema'
import {
  domainList,
  pfamAClansMap,
  ensureDomainDataLoaded,
  getPfamInfo,
} from '../../utils/pfam-domain-utils'

export * from './references.class'
export * from './references.schema'

function addPfamInfo() {
  return async (context: HookContext<ReferencesService>) => {
    // If domain data isn't loaded yet, load it
    ensureDomainDataLoaded()

    const { result } = context
    const { data } = result as Paginated<References>
    data.forEach((item) => {
      const pfamAcc = item.pfamAcc
      const pfamInfo = getPfamInfo(pfamAcc)
      item.pfamId = pfamInfo.pfamId
      item.pfamDesc = pfamInfo.pfamDesc
      item.clanAcc = pfamInfo.clanAcc
      item.clanId = pfamInfo.clanId
    })
    return context
  }
}

// A configure function that registers the service and its hooks via `app.configure`
export const references = (app: Application) => {
  // Register our service on the Feathers application
  app.use(referencesPath, new ReferencesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: referencesMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(referencesPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(referencesExternalResolver),
        schemaHooks.resolveResult(referencesResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(referencesQueryValidator),
        schemaHooks.resolveQuery(referencesQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(referencesDataValidator),
        schemaHooks.resolveData(referencesDataResolver),
      ],
      patch: [
        schemaHooks.validateData(referencesPatchValidator),
        schemaHooks.resolveData(referencesPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
      find: [addPfamInfo()],
    },
    error: {
      all: [],
    },
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [referencesPath]: ReferencesService
  }
}
