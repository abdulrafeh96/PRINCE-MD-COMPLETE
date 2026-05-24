const unavailable = require('./_eddyUnavailable');

module.exports = {
    reminiCommand: async (sock, chatId, message) => unavailable(sock, chatId, message, 'remini')
};
