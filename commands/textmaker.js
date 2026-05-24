const unavailable = require('./_eddyUnavailable');

module.exports = async function textmakerCommand(sock, chatId, message, userMessage, style) {
    await unavailable(sock, chatId, message, `${style || 'text'} maker`);
};
