const { toSmallCaps } = require('../lib/eddyStyle');

async function eddyUnavailable(sock, chatId, message, command = 'command') {
    if (!sock || !chatId) return;

    await sock.sendMessage(chatId, {
        text: `⚠️ *${toSmallCaps(command)}*\n\n_${toSmallCaps('ye command abhi api/module configure nahi hai.')}_`
    }, message ? { quoted: message } : undefined).catch(() => {});
}

module.exports = eddyUnavailable;
