const isAdmin = require('../lib/isAdmin');  // Move isAdmin to helpers
const style = require('../lib/eddyStyle');

async function tagAllCommand(sock, chatId, senderId, message) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: style.fail('please make the bot an admin first') }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: style.fail('only group admins can use the .tagall command') }, { quoted: message });
            return;
        }

        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { text: style.warn('no participants found in the group') });
            return;
        }

        // Create message with each member on a new line
        let messageText = `📢 *${style.toSmallCaps('attention everyone')}*\n\n`;
        messageText += participants.map(participant => `@${participant.id.split('@')[0]}`).join(' ');

        // Send message with mentions
        await sock.sendMessage(chatId, {
            text: messageText,
            mentions: participants.map(p => p.id)
        });

    } catch (error) {
        console.error('Error in tagall command:', error);
        await sock.sendMessage(chatId, { text: `❌ *${style.toSmallCaps('failed to tag all')}*` });
    }
}

module.exports = tagAllCommand;  // Export directly
