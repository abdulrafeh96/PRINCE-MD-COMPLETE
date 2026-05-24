const unavailable = require('./_eddyUnavailable');

module.exports = async function blurCommand(sock, chatId, message) {
    await unavailable(sock, chatId, message, 'image blur');
};
