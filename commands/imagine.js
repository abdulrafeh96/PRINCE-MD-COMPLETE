const unavailable = require('./_eddyUnavailable');

module.exports = async function imagineCommand(sock, chatId, message) {
    await unavailable(sock, chatId, message, 'ai image');
};
