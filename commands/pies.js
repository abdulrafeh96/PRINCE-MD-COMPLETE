const unavailable = require('./_eddyUnavailable');

module.exports = {
    piesCommand: async (sock, chatId, message) => unavailable(sock, chatId, message, 'pies'),
    piesAlias: async (sock, chatId, message, country) => unavailable(sock, chatId, message, `${country || 'pies'} image`)
};
