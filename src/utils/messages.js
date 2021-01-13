const moment = require('moment');

function formatMessage(username, text, room) {
    return {
        username,
        text,
        time: moment().format('h:mm a'),
        room
    };
}

module.exports = formatMessage;