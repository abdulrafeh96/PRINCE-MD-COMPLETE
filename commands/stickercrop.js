const unavailable = require('./_eddyUnavailable');

module.exports = async function stickercropCommand(sock, chatId, message) {
    await unavailable(sock, chatId, message, 'sticker crop');
};
