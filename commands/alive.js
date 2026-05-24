const settings = require('../settings');
const { box, formatUptime, nowParts } = require('./princeStyle');

async function aliveCommand(sock, chatId, message) {
    try {
        const { time, date } = nowParts();
        const text = box('🌸 𝐀𝐋𝐈𝐕𝐄', [
            `ʙᴏᴛ ɴᴀᴍᴇ : *${settings.botName || 'Prince Md'}*`,
            `ꜱᴛᴀᴛᴜꜱ : *ᴀᴄᴛɪᴠᴇ*`,
            `ᴍᴏᴅᴇ : *${settings.commandMode || 'public'}*`,
            `ᴜᴘᴛɪᴍᴇ : *${formatUptime(process.uptime())}*`,
            `ᴠᴇʀꜱɪᴏɴ : *${settings.version || '3.0.7'}*`,
            `ᴛɪᴍᴇ : *${time}*`,
            `ᴅᴀᴛᴇ : *${date}*`,
            `ᴍᴇɴᴜ : *.menu*`
        ], `𓆩 ${settings.botName || 'Prince Md'} 𓆪 ᴀᴛ ʏᴏᴜʀ ꜱᴇʀᴠɪᴄᴇ`);

        await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { text: `${settings.botName || 'Prince Md'} is alive and running!` }, { quoted: message });
    }
}

module.exports = aliveCommand;
