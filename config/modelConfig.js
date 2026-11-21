const mongoose = require('mongoose');
const logger = require('../utils/logger');

if (process.env.URL) {
    mongoose.connect(process.env.URL)
        .then(() => {
            console.log("Mongoose Connected");
            logger.log('info', 'Mongoose Connected');
        })
        .catch((error) => {
            console.error('Mongoose connection error:', error);
            logger.log('error', `Mongoose Error: ${error}`);
        });
} else {
    console.warn("MongoDB connection URL is not defined in process.env.URL");
}

mongoose.connection.on('connected', () => {
    console.log("Mongoose Connected");
});

mongoose.connection.on('error', (error) => {
    console.error('Mongoose connecting error:', error);
});
