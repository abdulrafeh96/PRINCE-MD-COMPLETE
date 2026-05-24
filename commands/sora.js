const unavailable = require('./_eddyUnavailable');

module.exports = async function soraCommand(sock, chatId, message) {
    await unavailable(sock, chatId, message, 'sora');
};
