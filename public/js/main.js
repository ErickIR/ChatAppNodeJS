const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const socket = io();
const usersList = document.getElementById('users');
const roomName = document.getElementById('room-name');

const URL = window.location.href;
const { username, room } = getParams(URL);

// Join ChatRoom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputRoomUsers(users);
});

// Message from Server
socket.on('message', message => {
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// socket.on('incomingMessage', chatMessage => console.log(`New chat message: ${chatMessage}`));

// Message submit
chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const inputElement = event.target.elements.msg;

    const msg = inputElement.value;

    socket.emit('chatMessage', msg);

    inputElement.value = '';
    inputElement.focus();
});

// Output message to DOM
function outputMessage(message) {
    console.log(message);
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML =
    `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text" style="color: #fff;">
        ${message.text}
    </p>
    `;

    chatMessages.appendChild(div);
}

function outputRoomName(room) {
    roomName.innerText = room;
}

function outputRoomUsers(users) {
    usersList.innerHTML = 
    `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

function getParams(url) {
    var params = {};
    var parser = document.createElement('a');
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    }
    console.log(params);
    return params;
}