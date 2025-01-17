// Do not change this file
require('dotenv').config();
const { MongoClient } = require('mongodb');
const URI = process.env.MONGO_URI; // Declare MONGO_URI in your .env file
const client = new MongoClient('mongodb+srv://allyson:78451278@cluster0.n5kla.mongodb.net/teste_05?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

async function main(callback) {
    try {
        await client.connect();
        console.log()
        console.log('Database connected')
        console.log();
        await callback(client);
    } catch (e) {
        console.log();
        console.error('Database disconected' + e);
        console.log();
        throw new Error('Unable to Connect to Database')
    }
}
module.exports = main;