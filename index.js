require('dotenv').config()
const express = require('express')

require('./config/modelConfig')
const mainRouter = require('./urls')
const logger = require('./utils/logger')

const app = express()

// Enable CORS for external access
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        status: true,
        message: "Library Management API is running successfully!",
        endpoints: [
            "/category/allCategory",
            "/books/addBook",
            "/users/signup",
            "/users/login"
        ]
    })
})

app.use('/', mainRouter)

const PORT = process.env.PORT || 9000

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`)
        logger.log('info', `Server is running on ${PORT}`)
    })
}

module.exports = app

