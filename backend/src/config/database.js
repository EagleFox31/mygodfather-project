require('dotenv').config();

module.exports = {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/godfather',
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        autoIndex: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
    }
};
