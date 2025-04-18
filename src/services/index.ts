import { references } from './references/references'
import { pfam } from './pfam/pfam'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(references)
  app.configure(pfam)
  // All services will be registered here
}
