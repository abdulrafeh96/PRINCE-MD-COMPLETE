const unavailable = require('./_eddyUnavailable');

module.exports = {
    igsCommand: async (sock, chatId, message) => unavailable(sock, chatId, message, 'instagram story')
};
