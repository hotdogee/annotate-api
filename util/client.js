require('dotenv').config()
const feathers = require('@feathersjs/client')
const io = require('socket.io-client')
const socket = io(process.env.SERVER_URL)
module.exports = feathers().configure(feathers.socketio(socket))
