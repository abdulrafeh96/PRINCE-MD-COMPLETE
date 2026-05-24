const unavailable = require('./_eddyUnavailable');

module.exports = async function stickerTelegramCommand(sock, chatId, message) {
    await unavailable(sock, chatId, message, 'telegram sticker');
};
