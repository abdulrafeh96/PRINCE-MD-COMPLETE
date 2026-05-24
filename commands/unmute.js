const style = require('../lib/eddyStyle');

async function unmuteCommand(sock, chatId) {
    try {
        await sock.groupSettingUpdate(chatId, 'not_announcement'); // Unmute the group
        await sock.sendMessage(chatId, { text: `🔊 *${style.toSmallCaps('group has been unmuted everyone can message')}*` });
    } catch {
        await sock.sendMessage(chatId, { text: `❌ *${style.toSmallCaps('failed to unmute group')}*` });
    }
}

module.exports = unmuteCommand;
