const fs = require('fs');
const path = require('path');
const { channelInfo } = require('../lib/messageConfig');
const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');
const style = require('../lib/eddyStyle');

async function unbanCommand(sock, chatId, message) {
    // Restrict in groups to admins; in private to owner/sudo
    const isGroup = chatId.endsWith('@g.us');
    if (isGroup) {
        const senderId = message.key.participant || message.key.remoteJid;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: style.fail('please make the bot an admin to use .unban'), }, { quoted: message });
            return;
        }
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: style.fail('only group admins can use .unban'), }, { quoted: message });
            return;
        }
    } else {
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        if (!message.key.fromMe && !senderIsSudo) {
            await sock.sendMessage(chatId, { text: style.fail('only owner/sudo can use .unban in private chat'), }, { quoted: message });
            return;
        }
    }
    let userToUnban;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToUnban = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToUnban) {
        await sock.sendMessage(chatId, { 
            text: style.warn('please mention the user or reply to their message to unban'),
        }, { quoted: message });
        return;
    }

    try {
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json'));
        const index = bannedUsers.indexOf(userToUnban);
        if (index > -1) {
            bannedUsers.splice(index, 1);
            fs.writeFileSync('./data/banned.json', JSON.stringify(bannedUsers, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: `✅ *${style.toSmallCaps('successfully unbanned')}* @${userToUnban.split('@')[0]}`,
                mentions: [userToUnban],
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `⚠️ @${userToUnban.split('@')[0]} *${style.toSmallCaps('is not banned')}*`,
                mentions: [userToUnban],
            });
        }
    } catch (error) {
        console.error('Error in unban command:', error);
        await sock.sendMessage(chatId, { text: style.fail('failed to unban user'), }, { quoted: message });
    }
}

module.exports = unbanCommand; 
