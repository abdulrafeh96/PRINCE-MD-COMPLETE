const unavailable = require('./_eddyUnavailable');

async function removebgCommand(sock, chatId, message) {
    await unavailable(sock, chatId, message, 'remove background');
}

removebgCommand.exec = async function (sock, message) {
    const chatId = message.key.remoteJid;
    await unavailable(sock, chatId, message, 'remove background');
};

module.exports = removebgCommand;
