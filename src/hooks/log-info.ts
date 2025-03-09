// For more information about this file see https://dove.feathersjs.com/guides/cli/log-error.html
import type { HookContext, NextFunction } from '../declarations'
import { logger } from '../logger'

export const logInfo = async (context: HookContext, next: NextFunction) => {
  try {
    logger.info(`${context.method.toUpperCase()} ${context.path}`)
    await next()
  } catch (error: any) {
    logger.error(error.stack)

    // Log validation errors
    if (error.data) {
      logger.error('Data: %O', error.data)
    }

    throw error
  }
}
