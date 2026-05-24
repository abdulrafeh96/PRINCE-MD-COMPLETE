const { handleWelcome } = require('../lib/welcome');
const { isWelcomeOn, getWelcome } = require('../lib/index');
const fetch = require('node-fetch');
const settings = require('../settings');
const { box, nowParts } = require('./princeStyle');

async function welcomeCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.' });
        return;
    }

    const text = message.message?.conversation ||
        message.message?.extendedTextMessage?.text || '';
    const matchText = text.split(' ').slice(1).join(' ');
    await handleWelcome(sock, chatId, message, matchText);
}

async function handleJoinEvent(sock, id, participants) {
    const isWelcomeEnabled = await isWelcomeOn(id);
    if (!isWelcomeEnabled) return;

    const customMessage = await getWelcome(id);
    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || 'No description available';

    for (const participant of participants) {
        try {
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            const timeString = new Date().toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            const customFinalMessage = customMessage
                ? customMessage
                    .replace(/{user}/g, `@${user}`)
                    .replace(/{group}/g, groupName)
                    .replace(/{description}/g, groupDesc)
                : '';
            const { time, date } = nowParts();
            const finalMessage = customFinalMessage || `╭━━〔 *WELCOME* 〕━━╮
┃ *Assalam-o-Alaikum* @${user}
┃
┃ *Welcome to ${groupName}*
┃
┃ This is a study group, so feel free to ask questions,
┃ share useful notes, and learn together.
╰━━━━━━━━━━━━╯

📚 *Study Reminder*
Stay respectful, avoid spam, and keep the discussion helpful for everyone.`;

            try {
                let profilePicUrl = 'https://img.pyrocdn.com/dbKUgahg.png';
                try {
                    const profilePic = await sock.profilePictureUrl(participantString, 'image');
                    if (profilePic) profilePicUrl = profilePic;
                } catch (_) {}

                const apiUrl = `https://api.some-random-api.com/welcome/img/2/gaming3?type=join&textcolor=green&username=${encodeURIComponent(user)}&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(profilePicUrl)}`;
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const imageBuffer = await response.buffer();
                    await sock.sendMessage(id, {
                        image: imageBuffer,
                        caption: finalMessage,
                        mentions: [participantString]
                    });
                    continue;
                }
            } catch (_) {}

            await sock.sendMessage(id, {
                text: finalMessage,
                mentions: [participantString]
            });
        } catch (error) {
            console.error('Error sending welcome message:', error);
        }
    }
}

module.exports = { welcomeCommand, handleJoinEvent };
