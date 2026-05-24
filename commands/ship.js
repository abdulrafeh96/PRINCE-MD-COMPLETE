const { toSmallCaps } = require('../lib/eddyStyle');

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = async function shipCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: `❌ *${toSmallCaps('this command is only for groups')}*` }, { quoted: message });
            return;
        }

        const meta = await sock.groupMetadata(chatId);
        const members = meta.participants.map(p => p.id);
        const sender = message.key.participant || message.key.remoteJid;
        const others = members.filter(m => m !== sender);
        const person2 = others[Math.floor(Math.random() * others.length)] || sender;
        const percentage = randomInt(1, 100);
        const hearts = percentage >= 80 ? '💖💖💖' : percentage >= 60 ? '💕💕' : percentage >= 40 ? '❤️' : '💔';

        const text = `💕 *${toSmallCaps('match found')}*\n\n` +
            `@${sender.split('@')[0]} + @${person2.split('@')[0]}\n\n` +
            `${'█'.repeat(Math.floor(percentage / 10))}${'░'.repeat(10 - Math.floor(percentage / 10))} ${percentage}%\n\n` +
            `${hearts} *Compatibility: ${percentage}%*`;

        await sock.sendMessage(chatId, { text, mentions: [sender, person2] }, { quoted: message });
    } catch {}
};
