const unavailable = require('./_eddyUnavailable');

module.exports = {
    stupidCommand: async (sock, chatId, message) => unavailable(sock, chatId, message, 'stupid')
};
