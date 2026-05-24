const isAdmin = require('../lib/isAdmin');
const style = require('../lib/eddyStyle');

async function muteCommand(sock, chatId, senderId, message, durationInMinutes) {
    

    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: style.fail('please make the bot an admin first') }, { quoted: message });
        return;
    }

    if (!isSenderAdmin) {
        await sock.sendMessage(chatId, { text: style.fail('only group admins can use the mute command') }, { quoted: message });
        return;
    }

    try {
        // Mute the group
        await sock.groupSettingUpdate(chatId, 'announcement');
        
        if (durationInMinutes !== undefined && durationInMinutes > 0) {
            const durationInMilliseconds = durationInMinutes * 60 * 1000;
            await sock.sendMessage(chatId, { text: `🔇 *${style.toSmallCaps('group has been muted only admins can message')}*\n⏰ *${durationInMinutes} ${style.toSmallCaps('minutes')}*` }, { quoted: message });
            
            // Set timeout to unmute after duration
            setTimeout(async () => {
                try {
                    await sock.groupSettingUpdate(chatId, 'not_announcement');
                    await sock.sendMessage(chatId, { text: `🔊 *${style.toSmallCaps('group has been unmuted everyone can message')}*` });
                } catch (unmuteError) {
                    console.error('Error unmuting group:', unmuteError);
                }
            }, durationInMilliseconds);
        } else {
            await sock.sendMessage(chatId, { text: `🔇 *${style.toSmallCaps('group has been muted only admins can message')}*` }, { quoted: message });
        }
    } catch (error) {
        console.error('Error muting/unmuting the group:', error);
        await sock.sendMessage(chatId, { text: `❌ *${style.toSmallCaps('failed to mute group')}*` }, { quoted: message });
    }
}

module.exports = muteCommand;
