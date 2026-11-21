const { createLogger, transports, format } = require('winston')
require('winston-mongodb')

const activeTransports = [
    new transports.Console({
        level: "info",
        format: format.combine(format.timestamp(), format.json())
    }),
    new transports.Console({
        level: "error",
        format: format.combine(format.timestamp(), format.json())
    })
]

if (!process.env.VERCEL) {
    try {
        activeTransports.push(
            new transports.File({
                filename: 'logs/logger.log',
                level: "info",
                maxsize: 5242880,
                format: format.combine(
                    format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                    format.align(),
                    format.printf(info => `level ${info.level}: ${info.timestamp} ${info.message}`)
                ),
            })
        )
    } catch (e) {
        console.warn('File transport disabled:', e.message)
    }
}

if (process.env.URL) {
    try {
        activeTransports.push(
            new transports.MongoDB({
                level: "info",
                db: process.env.URL,
                options: {
                    useUnifiedTopology: true,
                },
                collection: 'logsData',
                format: format.combine(format.timestamp(), format.json())
            })
        )
    } catch (e) {
        console.warn('MongoDB transport disabled:', e.message)
    }
}

const logger = createLogger({
    transports: activeTransports
})

module.exports = logger
