const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const socket = require('socket.io');
const port = 3000;

let users;
let count;
let chatRooms;
let messagesArray = [];
let dbUrl = 'mongodb+srv://admin:p@ssw0rd@cluster0.itpxz.mongodb.net/test';

const app = express();

app.use(bodyParser.json());

const MongoClient = mongodb.MongoClient;

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append("Access-Control-Allow-Headers", "Origin, Accept,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.append('Access-Control-Allow-Credentials', true);
    next();
});

MongoClient.connect(dbUrl, (err, Database) => {
    if (err) {
        console.log(err);
        return false;
    }

    console.log('Connected to MongoDB.');
    const db = Database.db('Chat_App');
    users = db.collection('users');
    chatRooms = db.collection('chatRooms');

    const server = app.listen(port, () => {
        console.log('Server started on port ' + port + '...');
    });
    const io = socket.listen(server);

    io.sockets.on('connection', (socket) => {
        socket.on('join', (data) => {
            socket.join(data.room);
            chatRooms.find({}).toArray((err, rooms) => {
                if (err) {
                    console.log(err);
                    return false;
                }

                count = 0;
                rooms.forEach((room) => {
                    if (room.name == data.room) {
                        count++;
                    }
                });

                if (count == 0) {
                    chatRooms.insert({ name: data.room, messages: [] });
                }
            });
        });
    });

    socket.on('message', (data) => {
        // emitting the 'new message' event to the clients in that room
        io.in(data.room).emit('new message', { user: data.user, message: data.message });
        // save the message in the 'messages' array of that chat-room
        chatRooms.update({ name: data.room }, { $push: { messages: { user: data.user, message: data.message } } }, (err, res) => {
            if (err) {
                console.log(err);
                return false;
            }
        });
    });

    socket.on('typing', (data) => {
        // Broadcasting to all the users except the one typing 
        socket.broadcast.in(data.room).emit('typing', { data: data, isTyping: true });
    });
});

app.get('/', (req, res, next) => {
    res.send('Welcome to the express server...');
});

app.post('/api/users', (req, res, next) => {
    let user = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    };

    let count = 0;

    users.find({}).toArray((err, Users))
})