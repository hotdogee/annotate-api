// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  pfamDataValidator,
  pfamPatchValidator,
  pfamQueryValidator,
  pfamResolver,
  pfamExternalResolver,
  pfamDataResolver,
  pfamPatchResolver,
  pfamQueryResolver,
} from './pfam.schema'

import type { Application } from '../../declarations'
import { PfamService, getOptions } from './pfam.class'
import { pfamPath, pfamMethods } from './pfam.shared'
import { checkCache } from '../../hooks/check-cache'

export * from './pfam.class'
export * from './pfam.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const pfam = (app: Application) => {
  // Register our service on the Feathers application
  app.use(pfamPath, new PfamService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: pfamMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(pfamPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(pfamExternalResolver),
        schemaHooks.resolveResult(pfamResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(pfamQueryValidator),
        schemaHooks.resolveQuery(pfamQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(pfamDataValidator),
        checkCache,
        schemaHooks.resolveData(pfamDataResolver),
      ],
      patch: [
        schemaHooks.validateData(pfamPatchValidator),
        schemaHooks.resolveData(pfamPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
      find: [],
      get: [],
      create: [],
    },
    error: {
      all: [],
    },
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [pfamPath]: PfamService
  }
}
