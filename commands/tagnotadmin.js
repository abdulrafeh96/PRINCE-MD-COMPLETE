const isAdmin = require('../lib/isAdmin');
const style = require('../lib/eddyStyle');

async function tagNotAdminCommand(sock, chatId, senderId, message) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: style.fail('please make the bot an admin first') }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: style.fail('only admins can use the .tagnotadmin command') }, { quoted: message });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];

        const nonAdmins = participants.filter(p => !p.admin).map(p => p.id);
        if (nonAdmins.length === 0) {
            await sock.sendMessage(chatId, { text: style.warn('no non-admin members to tag') }, { quoted: message });
            return;
        }

        let text = `🔊 *${style.toSmallCaps('hello everyone')}*\n\n`;
        nonAdmins.forEach(jid => {
            text += `@${jid.split('@')[0]}\n`;
        });

        await sock.sendMessage(chatId, { text, mentions: nonAdmins }, { quoted: message });
    } catch (error) {
        console.error('Error in tagnotadmin command:', error);
        await sock.sendMessage(chatId, { text: style.fail('failed to tag non-admin members') }, { quoted: message });
    }
}

module.exports = tagNotAdminCommand;
