const unavailable = require('./_eddyUnavailable');

module.exports = async function wastedCommand(sock, chatId, message) {
    await unavailable(sock, chatId, message, 'wasted');
};
