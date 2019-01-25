const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, printf } = format

const myFormat = printf(info => {
  return `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
})

module.exports = createLogger({
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console()]
})
