const unavailable = require('./_eddyUnavailable');

module.exports = async function simageCommand(sock, quotedMessage, chatId) {
    await unavailable(sock, chatId, null, 'sticker to image');
};
