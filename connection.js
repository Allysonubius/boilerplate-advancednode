// Do not change this file
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main(callback) {
    const URI = process.env.MONGO_URI; // Declare MONGO_URI in your .env file
    const client = new MongoClient('mongodb+srv://allyson:78451278@cluster0.n5kla.mongodb.net/teste_05?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connect to the MongoDB cluster
        await client.connect();
        console.log('Connected')

        // Make the appropriate DB calls
        await callback(client);

    } catch (e) {
        // Catch any errors
        console.error('Disconected' + e);
        throw new Error('Unable to Connect to Database')
    }
}

module.exports = main;