const { toSmallCaps } = require('../lib/eddyStyle');

module.exports = async function staffCommand(sock, chatId, message) {
    try {
        const meta = await sock.groupMetadata(chatId);
        const admins = meta.participants.filter(p => p.admin).map(p => p.id);
        if (!admins.length) throw new Error('No admins');

        await sock.sendMessage(chatId, {
            text: `👑 *${toSmallCaps('group staff')}*\n\n${admins.map((id, i) => `${i + 1}. @${id.split('@')[0]}`).join('\n')}`,
            mentions: admins
        }, { quoted: message });
    } catch (err) {
        await sock.sendMessage(chatId, { text: `❌ *${toSmallCaps('only for groups')}*` }, { quoted: message });
    }
};
