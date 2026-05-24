const unavailable = require('./_eddyUnavailable');

module.exports = {
    miscCommand: async (sock, chatId, message, args) => unavailable(sock, chatId, message, args?.[0] || 'misc command'),
    handleHeart: async (sock, chatId, message) => unavailable(sock, chatId, message, 'heart')
};
