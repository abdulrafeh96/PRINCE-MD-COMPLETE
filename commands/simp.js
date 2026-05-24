const unavailable = require('./_eddyUnavailable');

module.exports = {
    simpCommand: async (sock, chatId, message) => unavailable(sock, chatId, message, 'simp')
};
