var { MongoClient } = require('mongodb');


const mongoUri = 'mongodb://127.0.0.1:27017/';

const mongoClient = new MongoClient(mongoUri, { useUnifiedTopology: true });
let chatsCollection;
let database;
async function run() {
    try {
        await mongoClient.connect();

        database = mongoClient.db('chat_app');
        chatsCollection = database.collection('chats');

        console.log("Connected to the server.");
    } catch (err) {
        console.log(err.toString());
    }
}

run();

exports = { mongoClient, chatsCollection, database };