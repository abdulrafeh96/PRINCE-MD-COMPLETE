const unavailable = require('./_eddyUnavailable');

module.exports = {
    tictactoeCommand: async (sock, chatId, senderId, text, message) => unavailable(sock, chatId, message, 'tic tac toe'),
    handleTicTacToeMove: async (sock, chatId, senderId, text, message) => unavailable(sock, chatId, message, 'tic tac toe move')
};
