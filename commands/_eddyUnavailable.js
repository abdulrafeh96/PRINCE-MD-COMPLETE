const { toSmallCaps } = require('../lib/eddyStyle');

async function eddyUnavailable(sock, chatId, message, command = 'command') {
    if (!sock || !chatId) return;

    await sock.sendMessage(chatId, {
        text: `⚠️ *${toSmallCaps(command)}*\n\n_${toSmallCaps('this command is not configured with an api/module yet.')}_`
    }, message ? { quoted: message } : undefined).catch(() => {});
}

module.exports = eddyUnavailable;
