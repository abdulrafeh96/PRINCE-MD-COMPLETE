const settings = require('../settings');
const { box, formatUptime, nowParts } = require('./princeStyle');

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        const probe = await sock.sendMessage(chatId, { text: '𓆩 Prince Md 𓆪 ᴄʜᴇᴄᴋɪɴɢ...' }, { quoted: message });
        const ping = Date.now() - start;
        const { time, date } = nowParts();

        const botInfo = box('💠 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒', [
            `ʙᴏᴛ ɴᴀᴍᴇ : *${settings.botName || 'Prince Md'}*`,
            `ꜱᴛᴀᴛᴜꜱ : *ᴏɴʟɪɴᴇ*`,
            `ᴘɪɴɢ : *${ping} ms*`,
            `ᴜᴘᴛɪᴍᴇ : *${formatUptime(process.uptime())}*`,
            `ᴠᴇʀꜱɪᴏɴ : *${settings.version || '3.0.7'}*`,
            `ᴛɪᴍᴇ : *${time}*`,
            `ᴅᴀᴛᴇ : *${date}*`
        ]);

        if (probe?.key) {
            await sock.sendMessage(chatId, { edit: probe.key, text: botInfo });
        } else {
            await sock.sendMessage(chatId, { text: botInfo }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { text: box('❌ 𝐄𝐑𝐑𝐎𝐑', ['ᴘɪɴɢ ᴄʜᴇᴄᴋ ꜰᴀɪʟᴇᴅ']) }, { quoted: message });
    }
}

module.exports = pingCommand;
