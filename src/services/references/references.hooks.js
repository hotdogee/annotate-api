const pfamAClans = require('../../assets/pfamAClans')

/* eslint-disable no-unused-vars */
const debug = require('debug')('references.hooks')
const {
  FeathersError,
  BadRequest,
  NotAuthenticated,
  PaymentError,
  Forbidden,
  NotFound,
  MethodNotAllowed,
  NotAcceptable,
  Timeout,
  Conflict,
  LengthRequired,
  Unprocessable,
  TooManyRequests,
  GeneralError,
  NotImplemented,
  BadGateway,
  Unavailable
} = require('@feathersjs/errors')
const {
  iff,
  mongoKeys,
  keep,
  discard,
  disallow,
  isProvider,
  populate,
  alterItems,
  checkContext,
  paramsFromClient,
  paramsForServer
} = require('feathers-hooks-common')
/* eslint-enables no-unused-vars */

function addPfamInfo () {
  return async (context) => {
    // check type === 'after', method === 'find'
    checkContext(context, 'after', ['find'], 'addPfamInfo')
    const { result } = context
    const { data } = result
    data.forEach((item) => {
      const pfamAcc = item.pfamAcc
      item.pfamId = pfamAClans[pfamAcc].pfamId
      item.pfamDesc = pfamAClans[pfamAcc].pfamDesc
      item.clanAcc = pfamAClans[pfamAcc].clanAcc
      item.clanId = pfamAClans[pfamAcc].clanId
    })
    return context
  }
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [addPfamInfo()],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
