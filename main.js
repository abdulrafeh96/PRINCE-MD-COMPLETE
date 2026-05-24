// 🧹 Fix for ENOSPC / temp overflow in hosted panels
const fs = require('fs');
const path = require('path');

// Redirect temp storage away from system /tmp
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

// Auto-cleaner every 3 hours
setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => { });
                }
            });
        }
    });
    console.log('🧹 Temp folder auto-cleaned');
}, 3 * 60 * 60 * 1000);

const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const yts = require('yt-search');
const { fetchBuffer } = require('./lib/myfunc');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { isSudo, setChatLock, removeChatLock, isChatLocked, getLockedUsers } = require('./lib/index');
const isOwnerOrSudo = require('./lib/isOwner');
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = require('./commands/autotyping');
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = require('./commands/autoread');

// Command imports
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const { promoteCommand } = require('./commands/promote');
const { demoteCommand } = require('./commands/demote');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const stickerCommand = require('./commands/sticker');
const isAdmin = require('./lib/isAdmin');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const { tictactoeCommand, handleTicTacToeMove } = require('./commands/tictactoe');
const { incrementMessageCount, topMembers } = require('./commands/topmembers');
const ownerCommand = require('./commands/owner');
const deleteCommand = require('./commands/delete');
const { handleAntilinkCommand, handleLinkDetection } = require('./commands/antilink');
const { handleAntitagCommand, handleTagDetection } = require('./commands/antitag');
const { handleAntichannelCommand, handleChannelDetection } = require('./commands/antichannel');
const { handleAntistickerCommand, handleStickerDetection } = require('./commands/antisticker');
const { handleScheduleCommand, handleAutoOpenCommand, handleAutoCloseCommand, handleAutoStatusCommand } = require('./commands/schedule');
const { Antilink } = require('./lib/antilink');
const { handleMentionDetection, mentionToggleCommand, setMentionCommand } = require('./commands/mention');
const memeCommand = require('./commands/meme');
const tagCommand = require('./commands/tag');
const tagNotAdminCommand = require('./commands/tagnotadmin');
const hideTagCommand = require('./commands/hidetag');
const jokeCommand = require('./commands/joke');
const quoteCommand = require('./commands/quote');
const factCommand = require('./commands/fact');
const weatherCommand = require('./commands/weather');
const newsCommand = require('./commands/news');
const kickCommand = require('./commands/kick');
const simageCommand = require('./commands/simage');
const attpCommand = require('./commands/attp');
const { startHangman, guessLetter } = require('./commands/hangman');
const { startTrivia, answerTrivia } = require('./commands/trivia');
const { complimentCommand } = require('./commands/compliment');
const { insultCommand } = require('./commands/insult');
const { eightBallCommand } = require('./commands/eightball');
const { lyricsCommand } = require('./commands/lyrics');
const { dareCommand } = require('./commands/dare');
const { truthCommand } = require('./commands/truth');
const { clearCommand } = require('./commands/clear');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const blurCommand = require('./commands/img-blur');
const { welcomeCommand, handleJoinEvent } = require('./commands/welcome');
const githubCommand = require('./commands/github');
const { handleAntiBadwordCommand, handleBadwordDetection } = require('./lib/antibadword');
const antibadwordCommand = require('./commands/antibadword');
const { handleChatbotCommand, handleChatbotResponse } = require('./commands/chatbot');
const takeCommand = require('./commands/take');
const { flirtCommand } = require('./commands/flirt');
const characterCommand = require('./commands/character');
const wastedCommand = require('./commands/wasted');
const shipCommand = require('./commands/ship');
const groupInfoCommand = require('./commands/groupinfo');
const resetlinkCommand = require('./commands/resetlink');
const staffCommand = require('./commands/staff');
const unbanCommand = require('./commands/unban');
const emojimixCommand = require('./commands/emojimix');
const { handlePromotionEvent } = require('./commands/promote');
const { handleDemotionEvent } = require('./commands/demote');
const viewOnceCommand = require('./commands/viewonce');
const clearSessionCommand = require('./commands/clearsession');
const { autoStatusCommand, handleStatusUpdate } = require('./commands/autostatus');
const { simpCommand } = require('./commands/simp');
const { stupidCommand } = require('./commands/stupid');
const stickerTelegramCommand = require('./commands/stickertelegram');
const textmakerCommand = require('./commands/textmaker');
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete');
const clearTmpCommand = require('./commands/cleartmp');
const setProfilePicture = require('./commands/setpp');
const { setGroupDescription, setGroupName, setGroupPhoto } = require('./commands/groupmanage');
const instagramCommand = require('./commands/instagram');
const facebookCommand = require('./commands/facebook');
const spotifyCommand = require('./commands/spotify');
const playCommand = require('./commands/play');
const pairCommand = require('./commands/pair');
const tiktokCommand = require('./commands/tiktok');
const songCommand = require('./commands/song');
const pinterestCommand = require('./commands/pinterest');
const aiCommand = require('./commands/ai');
const urlCommand = require('./commands/url');
const { handleTranslateCommand } = require('./commands/translate');
const { handleSsCommand } = require('./commands/ss');
const { addCommandReaction, handleAreactCommand } = require('./lib/reactions');
const { goodnightCommand } = require('./commands/goodnight');
const { shayariCommand } = require('./commands/shayari');
const { rosedayCommand } = require('./commands/roseday');
const imagineCommand = require('./commands/imagine');
const videoCommand = require('./commands/video');
const sudoCommand = require('./commands/sudo');
const { miscCommand, handleHeart } = require('./commands/misc');
const { animeCommand } = require('./commands/anime');
const { piesCommand, piesAlias } = require('./commands/pies');
const stickercropCommand = require('./commands/stickercrop');
const updateCommand = require('./commands/update');
const removebgCommand = require('./commands/removebg');
const { reminiCommand } = require('./commands/remini');
const { igsCommand } = require('./commands/igs');
const { anticallCommand, readState: readAnticallState } = require('./commands/anticall');
const { pmblockerCommand, readState: readPmBlockerState } = require('./commands/pmblocker');
const settingsCommand = require('./commands/settings');
const soraCommand = require('./commands/sora');
const { disabledCommands, stableNotice } = require('./lib/stableBuild');
const eddyCompat = require('./commands/eddyCompat');
const style = require('./lib/eddyStyle');

// Global settings
global.packname = settings.packname;
global.author = settings.author;
global.ytch = "Mr Unique Hacker";

// Add this near the top of main.js with other global configurations
const channelInfo = {};

function commandArg(text) {
    return (text || '').trim().split(/\s+/).slice(1).join(' ').trim();
}

function mentionedOrNumber(message, rawText) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length) return mentioned[0];
    const contextInfo = message.message?.extendedTextMessage?.contextInfo || {};
    const quoted = contextInfo.quotedMessage || {};
    const quotedText = quoted.conversation ||
        quoted.extendedTextMessage?.text ||
        quoted.imageMessage?.caption ||
        quoted.videoMessage?.caption ||
        '';
    const quotedContact = quoted.contactMessage?.vcard ||
        quoted.contactsArrayMessage?.contacts?.map(contact => contact.vcard).join('\n') ||
        '';
    const quotedNumber = `${quotedText}\n${quotedContact}`.match(/(?:waid=|\+)?(\d{7,15})/i)?.[1];
    if (quotedNumber) return `${quotedNumber.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const replied = contextInfo.participant || '';
    if (replied.endsWith('@s.whatsapp.net')) return replied;
    const number = commandArg(rawText).replace(/[^0-9]/g, '');
    return number.length >= 5 ? `${number}@s.whatsapp.net` : '';
}

async function sendUnavailable(sock, chatId, message, command) {
    await sock.sendMessage(chatId, {
        text: `⚙️ *${command}*\n\n${style.toSmallCaps('feature abhi configure nahi hai')}\n${style.toSmallCaps('api/module connect karne ke baad ye live ho jayegi')}`,
        ...channelInfo
    }, { quoted: message });
}

async function addUserCommand(sock, chatId, message, rawText) {
    const jid = mentionedOrNumber(message, rawText);
    if (!jid) {
        await sock.sendMessage(chatId, { text: `❌ *${style.toSmallCaps('provide a number to add')}!*\n${style.toSmallCaps('you can also reply to a number/contact')}`, ...channelInfo }, { quoted: message });
        return;
    }
    await sock.groupParticipantsUpdate(chatId, [jid], 'add');
    await sock.sendMessage(chatId, { text: `✅ @${jid.split('@')[0]} *${style.toSmallCaps('added successfully')}*`, mentions: [jid], ...channelInfo }, { quoted: message });
}

async function linkGcCommand(sock, chatId, message) {
    const code = await sock.groupInviteCode(chatId);
    await sock.sendMessage(chatId, { text: `🔗 *${style.toSmallCaps('group invite link')}*:\nhttps://chat.whatsapp.com/${code}`, ...channelInfo }, { quoted: message });
}

async function groupStatusCommand(sock, chatId, message) {
    const metadata = await sock.groupMetadata(chatId);
    const admins = metadata.participants.filter(p => p.admin).length;
    await sock.sendMessage(chatId, {
        text: `*Group Status*\n\nName: ${metadata.subject}\nMembers: ${metadata.participants.length}\nAdmins: ${admins}\nAnnounce: ${metadata.announce ? 'On' : 'Off'}\nRestrict: ${metadata.restrict ? 'On' : 'Off'}`,
        ...channelInfo
    }, { quoted: message });
}

function targetFromMentionReplyOrNumber(message, rawText) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length) return mentioned[0];
    const replied = message.message?.extendedTextMessage?.contextInfo?.participant;
    if (replied) return replied;
    const number = commandArg(rawText).replace(/[^0-9]/g, '');
    return number.length >= 5 ? `${number}@s.whatsapp.net` : '';
}

async function lockChatCommand(sock, chatId, message, rawText, locked) {
    const target = targetFromMentionReplyOrNumber(message, rawText);
    if (!target) {
        await sock.sendMessage(chatId, {
            text: `❌ *${style.toSmallCaps(`tag reply or provide a number to ${locked ? 'lock' : 'unlock'} chat`)}!*\n\n` +
                `*Example:* .${locked ? 'lockchat' : 'unlockchat'} @user\n` +
                `*Example:* .${locked ? 'lockchat' : 'unlockchat'} 923001234567`,
            ...channelInfo
        }, { quoted: message });
        return;
    }

    const botId = sock.user?.id?.split(':')[0] || '';
    const targetDigits = target.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    if (targetDigits && botId && targetDigits === botId.replace(/[^0-9]/g, '')) {
        await sock.sendMessage(chatId, { text: `❌ *${style.toSmallCaps("i can't lock myself")}* 😄`, ...channelInfo }, { quoted: message });
        return;
    }

    if (locked) {
        await setChatLock(chatId, target, true);
        await sock.sendMessage(chatId, {
            text: `🔒 *${style.toSmallCaps('chat locked successfully')}*\n\n` +
                `👤 *${style.toSmallCaps('user')}:* ${target.split('@')[0]}\n` +
                `🔐 *${style.toSmallCaps('status')}:* ${style.toSmallCaps('locked')}\n\n` +
                `⚠️ *${style.toSmallCaps('user can no longer send messages')}*`,
            mentions: [target],
            ...channelInfo
        }, { quoted: message });
        return;
    }

    const unlocked = await removeChatLock(chatId, target);
    await sock.sendMessage(chatId, {
        text: unlocked
            ? `🔓 *${style.toSmallCaps('chat unlocked successfully')}*\n\n` +
                `👤 *${style.toSmallCaps('user')}:* ${target.split('@')[0]}\n` +
                `🔐 *${style.toSmallCaps('status')}:* ${style.toSmallCaps('unlocked')}\n\n` +
                `✅ *${style.toSmallCaps('user can now send messages')}*`
            : `❌ *${style.toSmallCaps('no lock found for this user')}*`,
        mentions: [target],
        ...channelInfo
    }, { quoted: message });
}

async function lockedUsersCommand(sock, chatId, message) {
    const lockedUsers = await getLockedUsers(chatId);
    if (!lockedUsers.length) {
        await sock.sendMessage(chatId, { text: `📋 *${style.toSmallCaps('no locked users in this group')}*`, ...channelInfo }, { quoted: message });
        return;
    }

    let text = `🔒 *${style.toSmallCaps('locked users list')}*\n\n`;
    lockedUsers.forEach((user, index) => {
        text += `${index + 1}. 👤 ${user.jid || user}\n`;
    });
    text += `\n📊 *${style.toSmallCaps('total locked')}:* ${lockedUsers.length}`;
    await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
}

async function resetWarnCommand(sock, chatId, message) {
    const warningsPath = path.join(process.cwd(), 'data', 'warnings.json');
    let warnings = {};
    try { warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8')); } catch (_) { }
    if (warnings[chatId]) delete warnings[chatId];
    fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
    await sock.sendMessage(chatId, { text: style.ok('warnings reset for this group'), ...channelInfo }, { quoted: message });
}

async function calcCommand(sock, chatId, message, rawText) {
    const expr = commandArg(rawText);
    if (!expr || !/^[0-9+\-*/().% \t]+$/.test(expr)) {
        await sock.sendMessage(chatId, { text: style.usage('usage', ['.calc 2+2']), ...channelInfo }, { quoted: message });
        return;
    }
    const result = Function(`"use strict"; return (${expr})`)();
    await sock.sendMessage(chatId, { text: `${expr} = ${result}`, ...channelInfo }, { quoted: message });
}

function fancyText(text) {
    const normal = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const fancy = Array.from('𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿');
    return text.split('').map(ch => {
        const i = normal.indexOf(ch);
        return i >= 0 ? fancy[i] : ch;
    }).join('');
}

async function getProfilePictureCommand(sock, chatId, message, rawText) {
    const jid = mentionedOrNumber(message, rawText) || message.message?.extendedTextMessage?.contextInfo?.participant || chatId;
    try {
        const url = await sock.profilePictureUrl(jid, 'image');
        await sock.sendMessage(chatId, { image: { url }, caption: `Profile picture: ${jid.split('@')[0]}`, ...channelInfo }, { quoted: message });
    } catch (_) {
        await sock.sendMessage(chatId, { text: style.fail('profile picture not available'), ...channelInfo }, { quoted: message });
    }
}

async function handleMessages(sock, messageUpdate, printLog) {
    let chatId = '';
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        // Handle autoread functionality
        await handleAutoread(sock, message);

        // Store message for antidelete feature
        if (message.message) {
            storeMessage(sock, message);
        }

        // Handle message revocation
        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const senderIsSudo = await isSudo(senderId);
        const senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);

        // Handle button responses
        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            const chatId = message.key.remoteJid;

            if (buttonId === 'channel') {
                await sock.sendMessage(chatId, {
                    text: '📢 *Join our Channel:*\nhttps://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A'
                }, { quoted: message });
                return;
            } else if (buttonId === 'owner') {
                const ownerCommand = require('./commands/owner');
                await ownerCommand(sock, chatId);
                return;
            } else if (buttonId === 'support') {
                await sock.sendMessage(chatId, {
                    text: `🔗 *Support*\n\nhttps://chat.whatsapp.com/GA4WrOFythU6g3BFVubYM7?mode=wwt`
                }, { quoted: message });
                return;
            }
        }

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            message.message?.buttonsResponseMessage?.selectedButtonId?.trim() ||
            ''
        ).toLowerCase().replace(/\.\s+/g, '.').trim();

        // Preserve raw message for commands like .tag that need original casing
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        // Only log command usage
        if (userMessage.startsWith('.')) {
            console.log(`📝 Command used in ${isGroup ? 'group' : 'private'}: ${userMessage}`);
        }
        // Read bot mode once; don't early-return so moderation can still run in private mode
        let isPublic = true;
        try {
            const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof data.isPublic === 'boolean') isPublic = data.isPublic;
        } catch (error) {
            console.error('Error checking access mode:', error);
            // default isPublic=true on error
        }
        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;
        // Check if user is banned (skip ban check for unban command)
        if (isBanned(senderId) && !userMessage.startsWith('.unban')) {
            // Only respond occasionally to avoid spam
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, {
                    text: '❌ You are banned from using the bot. Contact an admin to get unbanned.',
                    ...channelInfo
                });
            }
            return;
        }

        // First check if it's a game move
        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        /*  // Basic message response in private chat
          if (!isGroup && (userMessage === 'hi' || userMessage === 'hello' || userMessage === 'bot' || userMessage === 'hlo' || userMessage === 'hey' || userMessage === 'bro')) {
              await sock.sendMessage(chatId, {
                  text: 'Hi, How can I help you?\nYou can use .menu for more info and commands.',
                  ...channelInfo
              });
              return;
          } */

        if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

        if (isGroup && !message.key.fromMe && !senderIsOwnerOrSudo && await isChatLocked(chatId, senderId)) {
            await sock.sendMessage(chatId, {
                delete: {
                    remoteJid: chatId,
                    fromMe: false,
                    id: message.key.id,
                    participant: message.key.participant || senderId
                }
            }).catch(() => {});
            return;
        }

        // Check for bad words and antilink FIRST, before ANY other processing
        // Always run moderation in groups, regardless of mode
        if (isGroup) {
            if (userMessage) {
                await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
            }
            // Antilink checks message text internally, so run it even if userMessage is empty
            await Antilink(message, sock);
            await handleStickerDetection(sock, chatId, message, senderId);
            await handleChannelDetection(sock, chatId, message, senderId);
        }

        // PM blocker: block non-owner DMs when enabled (do not ban)
        if (!isGroup && !message.key.fromMe && !senderIsSudo) {
            try {
                const pmState = readPmBlockerState();
                if (pmState.enabled) {
                    // Inform user, delay, then block without banning globally
                    await sock.sendMessage(chatId, { text: pmState.message || style.fail('private messages are blocked. please contact the owner in groups only') });
                    await new Promise(r => setTimeout(r, 1500));
                    try { await sock.updateBlockStatus(chatId, 'block'); } catch (e) { }
                    return;
                }
            } catch (e) { }
        }

        // Then check for command prefix
        if (!userMessage.startsWith('.')) {
            // Show typing indicator if autotyping is enabled
            await handleAutotypingForMessage(sock, chatId, userMessage);

            if (isGroup) {
                // Always run moderation features (antitag) regardless of mode
                await handleTagDetection(sock, chatId, message, senderId);
                await handleMentionDetection(sock, chatId, message);

                // Only run chatbot in public mode or for owner/sudo
                if (isPublic || isOwnerOrSudoCheck) {
                    await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                }
            }
            return;
        }
        // In private mode, only owner/sudo can run commands
        if (!isPublic && !isOwnerOrSudoCheck) {
            return;
        }

        const commandName = userMessage.slice(1).split(/\s+/)[0];
        if (disabledCommands.has(commandName)) {
            await sock.sendMessage(chatId, {
                text: stableNotice,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // List of admin commands
        const adminCommands = ['.mute', '.unmute', '.ban', '.unban', '.promote', '.demote', '.kick', '.add', '.tagall', '.tagnotadmin', '.hidetag', '.antilink', '.antitag', '.antisticker', '.antichannel', '.antigroup', '.antispam', '.autoopen', '.autoclose', '.autostatus', '.antikeyword', '.antiword', '.antiwords', '.schedule', '.setgdesc', '.setgname', '.setgpp', '.setdesc', '.setname', '.setppgc', '.linkgc', '.revokegc', '.resetwarn', '.lockchat', '.unlockchat', '.lockedusers', '.groupstatus', '.setcmd', '.getcmd', '.delcmd'];
        const isAdminCommand = adminCommands.some(cmd => userMessage === cmd || userMessage.startsWith(`${cmd} `));

        // List of owner commands
        const ownerCommands = ['.mode', '.antidelete', '.cleartmp', '.setpp', '.clearsession', '.areact', '.autoreact', '.autotyping', '.autoread', '.pmblocker', '.addowner', '.removeowner', '.broadcast', '.bc', '.restart', '.afk', '.pnotify', '.dnotify', '.restrict', '.unrestrict', '.siminfo', '.cnicinfo', '.gen'];
        const isOwnerCommand = ownerCommands.some(cmd => userMessage === cmd || userMessage.startsWith(`${cmd} `));

        let isSenderAdmin = false;
        let isBotAdmin = false;

        // Check admin status only for admin commands in groups
        if (isGroup && isAdminCommand) {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: style.fail('please make the bot an admin to use admin commands'), ...channelInfo }, { quoted: message });
                return;
            }

            if (
                userMessage.startsWith('.mute') ||
                userMessage === '.unmute' ||
                userMessage.startsWith('.ban') ||
                userMessage.startsWith('.unban') ||
                userMessage.startsWith('.promote') ||
                userMessage.startsWith('.demote')
            ) {
                if (!isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, {
                        text: style.fail('sorry, only group admins can use this command'),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
            }
        }

        // Check owner status for owner commands
        if (isOwnerCommand) {
            if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, { text: style.fail('this command is only available for the owner or sudo') }, { quoted: message });
                return;
            }
        }

        // Command handlers - Execute commands immediately without waiting for typing indicator
        // We'll show typing indicator after command execution if needed
        let commandExecuted = false;

        switch (true) {
            case userMessage === '.simage':
            case userMessage === '.toimg': {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quotedMessage?.stickerMessage) {
                    await simageCommand(sock, quotedMessage, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: style.warn('please reply to a sticker with .toimg/.simage to convert it'), ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.kick'):
                const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
                break;
            case userMessage === '.add' || userMessage.startsWith('.add '):
                await addUserCommand(sock, chatId, message, rawText);
                break;
            case userMessage.startsWith('.mute'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const muteArg = parts[1];
                    const muteDuration = muteArg !== undefined ? parseInt(muteArg, 10) : undefined;
                    if (muteArg !== undefined && (isNaN(muteDuration) || muteDuration <= 0)) {
                        await sock.sendMessage(chatId, { text: style.warn('please provide a valid number of minutes or use .mute with no number to mute immediately'), ...channelInfo }, { quoted: message });
                    } else {
                        await muteCommand(sock, chatId, senderId, message, muteDuration);
                    }
                }
                break;
            case userMessage === '.unmute':
                await unmuteCommand(sock, chatId, senderId);
                break;
            case userMessage.startsWith('.ban'):
                if (!isGroup) {
                    if (!message.key.fromMe && !senderIsSudo) {
                        await sock.sendMessage(chatId, { text: style.fail('only owner/sudo can use .ban in private chat') }, { quoted: message });
                        break;
                    }
                }
                await banCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.unban'):
                if (!isGroup) {
                    if (!message.key.fromMe && !senderIsSudo) {
                        await sock.sendMessage(chatId, { text: style.fail('only owner/sudo can use .unban in private chat') }, { quoted: message });
                        break;
                    }
                }
                await unbanCommand(sock, chatId, message);
                break;
            case userMessage === '.help' || userMessage === '.menu' || userMessage === '.bot' || userMessage === '.list':
                await helpCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.sticker' || userMessage === '.s':
                await stickerCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage === '.stickerinfo':
                await eddyCompat.unavailable(sock, chatId, message, '.stickerinfo', 'Sticker info command recognize ho gayi hai. Current sticker module me metadata reader available nahi hai.');
                break;
            case userMessage.startsWith('.warnings'):
                const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warningsCommand(sock, chatId, mentionedJidListWarnings);
                break;
            case userMessage.startsWith('.warn'):
                const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
                break;
            case userMessage.startsWith('.tts'):
                const text = userMessage.slice(4).trim();
                await ttsCommand(sock, chatId, text, message);
                break;
            case userMessage.startsWith('.delete') || userMessage.startsWith('.del'):
                await deleteCommand(sock, chatId, message, senderId);
                break;
            case userMessage.startsWith('.attp'):
                await attpCommand(sock, chatId, message);
                break;

            case userMessage === '.settings':
                await settingsCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.mode'):
                // Check if sender is the owner
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: style.fail('only bot owner can use this command'), ...channelInfo }, { quoted: message });
                    return;
                }
                // Read current data first
                let data;
                try {
                    data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
                } catch (error) {
                    console.error('Error reading access mode:', error);
                    await sock.sendMessage(chatId, { text: style.fail('failed to read bot mode status'), ...channelInfo });
                    return;
                }

                const action = userMessage.split(' ')[1]?.toLowerCase();
                // If no argument provided, show current status
                if (!action) {
                    const currentMode = data.isPublic ? 'public' : 'private';
                    await sock.sendMessage(chatId, {
                        text: `📊 *${style.toSmallCaps('current bot mode')}*: *${currentMode}*\n\n` +
                            `📌 *${style.toSmallCaps('usage')}*: .mode public/private\n\n` +
                            `.mode public - ${style.toSmallCaps('allow everyone to use bot')}\n` +
                            `.mode private - ${style.toSmallCaps('restrict to owner only')}`,
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }

                if (action !== 'public' && action !== 'private') {
                    await sock.sendMessage(chatId, {
                        text: style.usage('usage', [
                            '.mode public',
                            '.mode private'
                        ]),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }

                try {
                    // Update access mode
                    data.isPublic = action === 'public';

                    // Save updated data
                    fs.writeFileSync('./data/messageCount.json', JSON.stringify(data, null, 2));

                    await sock.sendMessage(chatId, { text: style.ok(`bot is now in ${action} mode`), ...channelInfo });
                } catch (error) {
                    console.error('Error updating access mode:', error);
                    await sock.sendMessage(chatId, { text: style.fail('failed to update bot access mode'), ...channelInfo });
                }
                break;
            case userMessage.startsWith('.anticall'):
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: style.fail('only owner/sudo can use anticall') }, { quoted: message });
                    break;
                }
                {
                    const args = userMessage.split(' ').slice(1).join(' ');
                    await anticallCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.pmblocker'):
                {
                    const args = userMessage.split(' ').slice(1).join(' ');
                    await pmblockerCommand(sock, chatId, message, args);
                }
                commandExecuted = true;
                break;
            case userMessage === '.owner':
                await ownerCommand(sock, chatId);
                break;
            case userMessage === '.pair' || userMessage.startsWith('.pair '):
                await pairCommand(sock, chatId, message, commandArg(rawText));
                break;
            case userMessage === '.tagall':
                await tagAllCommand(sock, chatId, senderId, message);
                break;
            case userMessage === '.tagnotadmin':
                await tagNotAdminCommand(sock, chatId, senderId, message);
                break;
            case userMessage.startsWith('.hidetag'):
                {
                    const messageText = rawText.slice(8).trim();
                    const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                    await hideTagCommand(sock, chatId, senderId, messageText, replyMessage, message);
                }
                break;
            case userMessage.startsWith('.tag'):
                const messageText = rawText.slice(4).trim();  // use rawText here, not userMessage
                const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                await tagCommand(sock, chatId, senderId, messageText, replyMessage, message);
                break;
            case userMessage.startsWith('.antilink'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, {
                        text: style.fail('this command can only be used in groups'),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, {
                        text: style.fail('please make the bot an admin first'),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                break;
            case userMessage.startsWith('.antitag'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, {
                        text: style.fail('this command can only be used in groups'),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, {
                        text: style.fail('please make the bot an admin first'),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                await handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                break;
            case userMessage.startsWith('.antisticker'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, {
                        text: style.fail('this command can only be used in groups'),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, {
                        text: style.fail('please make the bot an admin first'),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                await handleAntistickerCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                break;
            case userMessage.startsWith('.antigroup'):
                await sendUnavailable(sock, chatId, message, '.antigroup');
                break;
            case userMessage.startsWith('.antispam') || userMessage.startsWith('.antikeyword') || userMessage.startsWith('.antiword') || userMessage.startsWith('.antiwords'):
                await eddyCompat.unavailable(sock, chatId, message, commandName, 'Ye EDDY group automation command recognize ho gayi hai. Current bot me equivalent setup ke liye .schedule / moderation modules use karein.');
                break;
            case userMessage.startsWith('.antichannel'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, {
                        text: style.fail('this command can only be used in groups'),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, {
                        text: style.fail('please make the bot an admin first'),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                await handleAntichannelCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                break;
            case userMessage.startsWith('.schedule'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, {
                        text: style.fail('this command can only be used in groups'),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, {
                        text: style.fail('please make the bot an admin first'),
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                await handleScheduleCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                break;
            case userMessage.startsWith('.autoopen'):
                await handleAutoOpenCommand(sock, chatId, userMessage.trim().split(/\s+/).slice(1), senderId, isSenderAdmin, message);
                break;
            case userMessage.startsWith('.autoclose'):
                await handleAutoCloseCommand(sock, chatId, userMessage.trim().split(/\s+/).slice(1), senderId, isSenderAdmin, message);
                break;
            case userMessage.startsWith('.autostatus'):
                if (isGroup) {
                    await handleAutoStatusCommand(sock, chatId, senderId, isSenderAdmin, message);
                } else {
                    const autoStatusArgs = userMessage.split(' ').slice(1);
                    await autoStatusCommand(sock, chatId, message, autoStatusArgs);
                }
                break;
            case userMessage === '.meme':
                await memeCommand(sock, chatId, message);
                break;
            case userMessage === '.joke':
                await jokeCommand(sock, chatId, message);
                break;
            case userMessage === '.quote':
                await quoteCommand(sock, chatId, message);
                break;
            case userMessage === '.fact':
                await factCommand(sock, chatId, message, message);
                break;
            case userMessage.startsWith('.weather'):
                const city = userMessage.slice(9).trim();
                if (city) {
                    await weatherCommand(sock, chatId, message, city);
                } else {
                    await sock.sendMessage(chatId, { text: style.usage('usage', ['.weather London']), ...channelInfo }, { quoted: message });
                }
                break;
            case userMessage === '.news':
                await newsCommand(sock, chatId);
                break;
            case userMessage.startsWith('.ttt') || userMessage.startsWith('.tictactoe') || userMessage.startsWith('.tic'):
                const tttText = userMessage.split(' ').slice(1).join(' ');
                await tictactoeCommand(sock, chatId, senderId, tttText);
                break;
            case userMessage.startsWith('.move'):
                const position = parseInt(userMessage.split(' ')[1]);
                if (isNaN(position)) {
                    await sock.sendMessage(chatId, { text: style.warn('please provide a valid position number for tic-tac-toe move'), ...channelInfo }, { quoted: message });
                } else {
                    tictactoeMove(sock, chatId, senderId, position);
                }
                break;
            case userMessage === '.topmembers' || userMessage === '.rank':
                topMembers(sock, chatId, isGroup);
                break;
            case userMessage.startsWith('.hangman'):
                startHangman(sock, chatId, message);
                break;
            case userMessage === '.son' || userMessage === '.beta':
                await eddyCompat.randomMember(sock, chatId, message, 'Son');
                break;
            case userMessage === '.daughter' || userMessage === '.beti':
                await eddyCompat.randomMember(sock, chatId, message, 'Daughter');
                break;
            case userMessage === '.wife':
                await eddyCompat.randomMember(sock, chatId, message, 'Wife');
                break;
            case userMessage.startsWith('.guess'):
                const guessedLetter = userMessage.split(' ')[1];
                if (guessedLetter) {
                    guessLetter(sock, chatId, guessedLetter, message);
                } else {
                    sock.sendMessage(chatId, { text: style.usage('usage', ['.guess <letter>']), ...channelInfo }, { quoted: message });
                }
                break;
            case userMessage.startsWith('.trivia'):
                startTrivia(sock, chatId);
                break;
            case userMessage.startsWith('.answer'):
                const answer = userMessage.split(' ').slice(1).join(' ');
                if (answer) {
                    answerTrivia(sock, chatId, answer);
                } else {
                    sock.sendMessage(chatId, { text: style.usage('usage', ['.answer <answer>']), ...channelInfo }, { quoted: message });
                }
                break;
            case userMessage.startsWith('.compliment'):
                await complimentCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.insult'):
                await insultCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.8ball'):
                const question = userMessage.split(' ').slice(1).join(' ');
                await eightBallCommand(sock, chatId, question);
                break;
            case userMessage.startsWith('.lyrics'):
                const songTitle = userMessage.split(' ').slice(1).join(' ');
                await lyricsCommand(sock, chatId, songTitle, message);
                break;
            case userMessage.startsWith('.simp'):
                const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await simpCommand(sock, chatId, quotedMsg, mentionedJid, senderId);
                break;
            case userMessage.startsWith('.stupid') || userMessage.startsWith('.itssostupid') || userMessage.startsWith('.iss'):
                const stupidQuotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const stupidMentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                const stupidArgs = userMessage.split(' ').slice(1);
                await stupidCommand(sock, chatId, stupidQuotedMsg, stupidMentionedJid, senderId, stupidArgs);
                break;
            case userMessage === '.dare':
                await dareCommand(sock, chatId, message);
                break;
            case userMessage === '.truth':
                await truthCommand(sock, chatId, message);
                break;
            case userMessage === '.clear':
                if (isGroup) await clearCommand(sock, chatId);
                break;
            case userMessage.startsWith('.promote'):
                const mentionedJidListPromote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await promoteCommand(sock, chatId, mentionedJidListPromote, message);
                break;
            case userMessage.startsWith('.demote'):
                const mentionedJidListDemote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await demoteCommand(sock, chatId, mentionedJidListDemote, message);
                break;
            case userMessage === '.ping':
                await pingCommand(sock, chatId, message);
                break;
            case userMessage === '.speed':
            case userMessage === '.uptime':
            case userMessage === '.info':
                await pingCommand(sock, chatId, message);
                break;
            case userMessage === '.alive':
                await aliveCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.mention '):
                {
                    const args = userMessage.split(' ').slice(1).join(' ');
                    const isOwner = message.key.fromMe || senderIsSudo;
                    await mentionToggleCommand(sock, chatId, message, args, isOwner);
                }
                break;
            case userMessage === '.setmention':
                {
                    const isOwner = message.key.fromMe || senderIsSudo;
                    await setMentionCommand(sock, chatId, message, isOwner);
                }
                break;
            case userMessage.startsWith('.blur'):
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                await blurCommand(sock, chatId, message, quotedMessage);
                break;
            case userMessage.startsWith('.welcome'):
                if (isGroup) {
                    // Check admin status if not already checked
                    if (!isSenderAdmin) {
                        const adminStatus = await isAdmin(sock, chatId, senderId);
                        isSenderAdmin = adminStatus.isSenderAdmin;
                    }

                    if (isSenderAdmin || message.key.fromMe) {
                        await welcomeCommand(sock, chatId, message);
                    } else {
                        await sock.sendMessage(chatId, { text: style.fail('sorry, only group admins can use this command'), ...channelInfo }, { quoted: message });
                    }
                } else {
                    await sock.sendMessage(chatId, { text: style.fail('this command can only be used in groups'), ...channelInfo }, { quoted: message });
                }
                break;
            case userMessage === '.git':
            case userMessage === '.github':
            case userMessage === '.sc':
            case userMessage === '.script':
            case userMessage === '.repo':
                await githubCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.antibadword'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: style.fail('this command can only be used in groups'), ...channelInfo }, { quoted: message });
                    return;
                }

                const adminStatus = await isAdmin(sock, chatId, senderId);
                isSenderAdmin = adminStatus.isSenderAdmin;
                isBotAdmin = adminStatus.isBotAdmin;

                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, { text: style.fail('bot must be admin to use this feature'), ...channelInfo }, { quoted: message });
                    return;
                }

                await antibadwordCommand(sock, chatId, message, senderId, isSenderAdmin);
                break;
            case userMessage.startsWith('.chatbot'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: style.fail('this command can only be used in groups'), ...channelInfo }, { quoted: message });
                    return;
                }

                // Check if sender is admin or bot owner
                const chatbotAdminStatus = await isAdmin(sock, chatId, senderId);
                if (!chatbotAdminStatus.isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, { text: style.fail('only admins or bot owner can use this command'), ...channelInfo }, { quoted: message });
                    return;
                }

                const match = userMessage.slice(8).trim();
                await handleChatbotCommand(sock, chatId, message, match);
                break;
            case userMessage.startsWith('.take') || userMessage.startsWith('.steal'):
                {
                    const isSteal = userMessage.startsWith('.steal');
                    const sliceLen = isSteal ? 6 : 5; // '.steal' vs '.take'
                    const takeArgs = rawText.slice(sliceLen).trim().split(' ');
                    await takeCommand(sock, chatId, message, takeArgs);
                }
                break;
            case userMessage === '.flirt':
                await flirtCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.character'):
                await characterCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.waste'):
                await wastedCommand(sock, chatId, message);
                break;
            case userMessage === '.ship':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await shipCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.rate'):
                await eddyCompat.rate(sock, chatId, message, rawText);
                break;
            case userMessage === '.groupinfo' || userMessage === '.infogp' || userMessage === '.infogrupo':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await groupInfoCommand(sock, chatId, message);
                break;
            case userMessage === '.groupstatus':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await groupStatusCommand(sock, chatId, message);
                break;
            case userMessage === '.linkgc':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await linkGcCommand(sock, chatId, message);
                break;
            case userMessage === '.resetlink' || userMessage === '.revoke' || userMessage === '.revokegc' || userMessage === '.anularlink':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await resetlinkCommand(sock, chatId, senderId);
                break;
            case userMessage === '.resetwarn':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await resetWarnCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.lockchat'):
                await lockChatCommand(sock, chatId, message, rawText, true);
                break;
            case userMessage.startsWith('.unlockchat'):
                await lockChatCommand(sock, chatId, message, rawText, false);
                break;
            case userMessage === '.lockedusers':
                await lockedUsersCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.setcmd') || userMessage.startsWith('.getcmd') || userMessage.startsWith('.delcmd'):
                await eddyCompat.unavailable(sock, chatId, message, commandName, 'Sticker command mapping EDDY me database-based hai. Is bot me module port karne ke liye DB adapter chahiye.');
                break;
            case userMessage === '.staff' || userMessage === '.admins' || userMessage === '.listadmin':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await staffCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.tourl') || userMessage.startsWith('.url'):
                await urlCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.emojimix') || userMessage.startsWith('.emix'):
                await emojimixCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.tg') || userMessage.startsWith('.stickertelegram') || userMessage.startsWith('.tgsticker') || userMessage.startsWith('.telesticker'):
                await stickerTelegramCommand(sock, chatId, message);
                break;

            case userMessage === '.vv' || userMessage === '.viewonce':
                await viewOnceCommand(sock, chatId, message);
                break;
            case userMessage === '.clearsession' || userMessage === '.clearsesi':
                await clearSessionCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.autostatus'):
                const autoStatusArgs = userMessage.split(' ').slice(1);
                await autoStatusCommand(sock, chatId, message, autoStatusArgs);
                break;
            case userMessage.startsWith('.simp'):
                await simpCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.metallic'):
                await textmakerCommand(sock, chatId, message, userMessage, 'metallic');
                break;
            case userMessage.startsWith('.ice'):
                await textmakerCommand(sock, chatId, message, userMessage, 'ice');
                break;
            case userMessage.startsWith('.snow'):
                await textmakerCommand(sock, chatId, message, userMessage, 'snow');
                break;
            case userMessage.startsWith('.impressive'):
                await textmakerCommand(sock, chatId, message, userMessage, 'impressive');
                break;
            case userMessage.startsWith('.matrix'):
                await textmakerCommand(sock, chatId, message, userMessage, 'matrix');
                break;
            case userMessage.startsWith('.light'):
                await textmakerCommand(sock, chatId, message, userMessage, 'light');
                break;
            case userMessage.startsWith('.neon'):
                await textmakerCommand(sock, chatId, message, userMessage, 'neon');
                break;
            case userMessage.startsWith('.devil'):
                await textmakerCommand(sock, chatId, message, userMessage, 'devil');
                break;
            case userMessage.startsWith('.purple'):
                await textmakerCommand(sock, chatId, message, userMessage, 'purple');
                break;
            case userMessage.startsWith('.thunder'):
                await textmakerCommand(sock, chatId, message, userMessage, 'thunder');
                break;
            case userMessage.startsWith('.leaves'):
                await textmakerCommand(sock, chatId, message, userMessage, 'leaves');
                break;
            case userMessage.startsWith('.1917'):
                await textmakerCommand(sock, chatId, message, userMessage, '1917');
                break;
            case userMessage.startsWith('.arena'):
                await textmakerCommand(sock, chatId, message, userMessage, 'arena');
                break;
            case userMessage.startsWith('.hacker'):
                await textmakerCommand(sock, chatId, message, userMessage, 'hacker');
                break;
            case userMessage.startsWith('.sand'):
                await textmakerCommand(sock, chatId, message, userMessage, 'sand');
                break;
            case userMessage.startsWith('.blackpink'):
                await textmakerCommand(sock, chatId, message, userMessage, 'blackpink');
                break;
            case userMessage.startsWith('.glitch'):
                await textmakerCommand(sock, chatId, message, userMessage, 'glitch');
                break;
            case userMessage.startsWith('.fire'):
                await textmakerCommand(sock, chatId, message, userMessage, 'fire');
                break;
            case userMessage.startsWith('.antidelete'):
                const antideleteMatch = userMessage.slice(11).trim();
                await handleAntideleteCommand(sock, chatId, message, antideleteMatch);
                break;
            case userMessage === '.surrender':
                // Handle surrender command for tictactoe game
                await handleTicTacToeMove(sock, chatId, senderId, 'surrender');
                break;
            case userMessage === '.cleartmp':
                await clearTmpCommand(sock, chatId, message);
                break;
            case userMessage === '.setpp':
                await setProfilePicture(sock, chatId, message);
                break;
            case userMessage.startsWith('.setgdesc') || userMessage.startsWith('.setdesc'):
                {
                    const text = commandArg(rawText);
                    await setGroupDescription(sock, chatId, senderId, text, message);
                }
                break;
            case userMessage.startsWith('.setgname') || userMessage.startsWith('.setname'):
                {
                    const text = commandArg(rawText);
                    await setGroupName(sock, chatId, senderId, text, message);
                }
                break;
            case userMessage.startsWith('.setgpp') || userMessage.startsWith('.setppgc'):
                await setGroupPhoto(sock, chatId, senderId, message);
                break;
            case userMessage.startsWith('.instagram') || userMessage.startsWith('.insta') || (userMessage === '.ig' || userMessage.startsWith('.ig ')):
                await instagramCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.igsc'):
                await igsCommand(sock, chatId, message, true);
                break;
            case userMessage.startsWith('.igs'):
                await igsCommand(sock, chatId, message, false);
                break;
            case userMessage.startsWith('.fb') || userMessage.startsWith('.facebook'):
                await facebookCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.music'):
                await playCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.spotify'):
                await spotifyCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.play') || userMessage.startsWith('.mp3') || userMessage.startsWith('.ytmp3') || userMessage.startsWith('.song') || userMessage.startsWith('.tomp3'):
                await songCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.video') || userMessage.startsWith('.ytmp4'):
                await videoCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.twitter') || userMessage.startsWith('.tw') || userMessage.startsWith('.terabox') || userMessage.startsWith('.tb') || userMessage.startsWith('.sstatus'):
                await eddyCompat.unavailable(sock, chatId, message, commandName);
                break;
            case userMessage.startsWith('.tiktok') || userMessage.startsWith('.tt') || userMessage.startsWith('.ttstalk') || userMessage.startsWith('.tiktokstalk') || userMessage.startsWith('.tiktokstalker') || userMessage.startsWith('.ttinfo') || userMessage.startsWith('.gif'):
                await tiktokCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.pinterest') || userMessage.startsWith('.pin ') || userMessage === '.pin' || userMessage.startsWith('.pindl') || userMessage.startsWith('.pinterestdl'):
                await pinterestCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.gpt') || userMessage.startsWith('.chatgpt') || userMessage.startsWith('.gemini') || userMessage.startsWith('.wormgpt') || userMessage.startsWith('.wgpt') || userMessage.startsWith('.cursorai') || userMessage.startsWith('.cursor') || userMessage.startsWith('.claude') || userMessage.startsWith('.grok') || userMessage.startsWith('.devin') || userMessage.startsWith('.windsurf') || userMessage.startsWith('.codex') || userMessage.startsWith('.gpt5.4') || userMessage.startsWith('.bolt') || userMessage.startsWith('.kiro') || userMessage.startsWith('.bbc'):
                await aiCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.chatbotdm') || userMessage.startsWith('.chatbotgc'):
                await sendUnavailable(sock, chatId, message, commandName);
                break;
            case userMessage.startsWith('.translate') || userMessage.startsWith('.trt'):
                const commandLength = userMessage.startsWith('.translate') ? 10 : 4;
                await handleTranslateCommand(sock, chatId, message, userMessage.slice(commandLength));
                return;
            case userMessage.startsWith('.calc'):
                await calcCommand(sock, chatId, message, rawText);
                break;
            case userMessage.startsWith('.qr'):
                await eddyCompat.qr(sock, chatId, message, rawText);
                break;
            case userMessage.startsWith('.shorturl'):
                await eddyCompat.shorturl(sock, chatId, message, rawText);
                break;
            case userMessage.startsWith('.wiki'):
                await eddyCompat.wiki(sock, chatId, message, rawText);
                break;
            case userMessage.startsWith('.google') || userMessage.startsWith('.search'):
                await eddyCompat.google(sock, chatId, message, rawText);
                break;
            case userMessage.startsWith('.image') || userMessage.startsWith('.img'):
                await eddyCompat.image(sock, chatId, message, rawText);
                break;
            case userMessage.startsWith('.web'):
                await handleSsCommand(sock, chatId, message, commandArg(rawText));
                break;
            case userMessage.startsWith('.numbertracker') || userMessage.startsWith('.numtrack') || userMessage.startsWith('.checknumber') || userMessage.startsWith('.checknum'):
                await eddyCompat.numbertracker(sock, chatId, message, rawText);
                break;
            case userMessage.startsWith('.iptracker') || userMessage.startsWith('.iptrack'):
                await eddyCompat.iptracker(sock, chatId, message, rawText);
                break;
            case userMessage.startsWith('.fakenumber') || userMessage.startsWith('.fakenum') || userMessage.startsWith('.otp') || userMessage.startsWith('.otpstatus'):
                await eddyCompat.otpNotice(sock, chatId, message);
                break;
            case userMessage.startsWith('.reverse'):
                await sock.sendMessage(chatId, { text: commandArg(rawText).split('').reverse().join(''), ...channelInfo }, { quoted: message });
                break;
            case userMessage.startsWith('.fancy'):
                await sock.sendMessage(chatId, { text: fancyText(commandArg(rawText)), ...channelInfo }, { quoted: message });
                break;
            case userMessage.startsWith('.react'):
                await sock.sendMessage(chatId, { react: { text: commandArg(rawText) || '✅', key: message.key } });
                break;
            case userMessage === '.totalchat':
                topMembers(sock, chatId, isGroup);
                break;
            case userMessage.startsWith('.getpp'):
                await getProfilePictureCommand(sock, chatId, message, rawText);
                break;
            case userMessage.startsWith('.wastalk') || userMessage.startsWith('.wastatus'):
                await eddyCompat.unavailable(sock, chatId, message, commandName, 'WhatsApp stalk/status lookup ke liye EDDY ka separate module tha. Current bot me safe placeholder add kar diya gaya hai.');
                break;
            case userMessage.startsWith('.ss') || userMessage.startsWith('.ssweb') || userMessage.startsWith('.screenshot'):
                const ssCommandLength = userMessage.startsWith('.screenshot') ? 11 : (userMessage.startsWith('.ssweb') ? 6 : 3);
                await handleSsCommand(sock, chatId, message, userMessage.slice(ssCommandLength).trim());
                break;
            case userMessage.startsWith('.areact') || userMessage.startsWith('.autoreact') || userMessage.startsWith('.autoreaction'):
                await handleAreactCommand(sock, chatId, message, isOwnerOrSudoCheck);
                break;
            case userMessage.startsWith('.sudo'):
                await sudoCommand(sock, chatId, message);
                break;
            case userMessage === '.goodnight' || userMessage === '.lovenight' || userMessage === '.gn':
                await goodnightCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.poetry') || userMessage.startsWith('.shayari') || userMessage.startsWith('.shayri'):
                await shayariCommand(sock, chatId, message, rawText);
                break;
            case userMessage === '.roseday':
                await rosedayCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.imagine') || userMessage.startsWith('.flux') || userMessage.startsWith('.dalle') || userMessage.startsWith('.aiimage') || userMessage.startsWith('.aiimg'): await imagineCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.hd'):
                await reminiCommand(sock, chatId, message, userMessage.split(' ').slice(1));
                break;
            case userMessage.startsWith('.wallpaper') || userMessage.startsWith('.wp'):
                await eddyCompat.wallpaper(sock, chatId, message, rawText);
                break;
            case userMessage.startsWith('.gen'):
                await eddyCompat.unavailable(sock, chatId, message, '.gen', 'CC generator ko safety ki wajah se enable nahi kiya. Main fake/financial credential generator add nahi kar sakta.');
                break;
            case userMessage.startsWith('.broadcast') || userMessage.startsWith('.bc'):
                await eddyCompat.unavailable(sock, chatId, message, commandName, 'Broadcast command recognize ho gayi hai; current bot me mass-message module configure nahi hai.');
                break;
            case userMessage.startsWith('.addowner') || userMessage.startsWith('.removeowner') || userMessage.startsWith('.restart') || userMessage.startsWith('.afk') || userMessage.startsWith('.pnotify') || userMessage.startsWith('.dnotify') || userMessage.startsWith('.restrict') || userMessage.startsWith('.unrestrict') || userMessage.startsWith('.siminfo') || userMessage.startsWith('.cnicinfo'):
                await eddyCompat.unavailable(sock, chatId, message, commandName);
                break;
            case userMessage === '.jid': await groupJidCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('.autotyping'):
                await autotypingCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.autoread'):
                await autoreadCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.heart'):
                await handleHeart(sock, chatId, message);
                break;
            case userMessage.startsWith('.horny'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['horny', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.circle'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['circle', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.lgbt'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['lgbt', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.lolice'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['lolice', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.simpcard'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['simpcard', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.tonikawa'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['tonikawa', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.its-so-stupid'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['its-so-stupid', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.namecard'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['namecard', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;

            case userMessage.startsWith('.oogway2'):
            case userMessage.startsWith('.oogway'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const sub = userMessage.startsWith('.oogway2') ? 'oogway2' : 'oogway';
                    const args = [sub, ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.tweet'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['tweet', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.ytcomment'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = ['youtube-comment', ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.comrade'):
            case userMessage.startsWith('.gay'):
            case userMessage.startsWith('.glass'):
            case userMessage.startsWith('.jail'):
            case userMessage.startsWith('.passed'):
            case userMessage.startsWith('.triggered'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const sub = userMessage.slice(1).split(/\s+/)[0];
                    const args = [sub, ...parts.slice(1)];
                    await miscCommand(sock, chatId, message, args);
                }
                break;
            case userMessage.startsWith('.animu'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const args = parts.slice(1);
                    await animeCommand(sock, chatId, message, args);
                }
                break;
            // animu aliases
            case userMessage.startsWith('.nom'):
            case userMessage.startsWith('.poke'):
            case userMessage.startsWith('.cry'):
            case userMessage.startsWith('.kiss'):
            case userMessage.startsWith('.pat'):
            case userMessage.startsWith('.hug'):
            case userMessage.startsWith('.wink'):
            case userMessage.startsWith('.facepalm'):
            case userMessage.startsWith('.face-palm'):
            case userMessage.startsWith('.animuquote'):
            case userMessage.startsWith('.quote'):
            case userMessage.startsWith('.loli'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    let sub = parts[0].slice(1);
                    if (sub === 'facepalm') sub = 'face-palm';
                    if (sub === 'quote' || sub === 'animuquote') sub = 'quote';
                    await animeCommand(sock, chatId, message, [sub]);
                }
                break;
            case userMessage === '.crop':
                await stickercropCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('.pies'):
                {
                    const parts = rawText.trim().split(/\s+/);
                    const args = parts.slice(1);
                    await piesCommand(sock, chatId, message, args);
                    commandExecuted = true;
                }
                break;
            case userMessage === '.china':
                await piesAlias(sock, chatId, message, 'china');
                commandExecuted = true;
                break;
            case userMessage === '.indonesia':
                await piesAlias(sock, chatId, message, 'indonesia');
                commandExecuted = true;
                break;
            case userMessage === '.japan':
                await piesAlias(sock, chatId, message, 'japan');
                commandExecuted = true;
                break;
            case userMessage === '.korea':
                await piesAlias(sock, chatId, message, 'korea');
                commandExecuted = true;
                break;
            case userMessage === '.india':
                await piesAlias(sock, chatId, message, 'india');
                commandExecuted = true;
                break;
            case userMessage === '.malaysia':
                await piesAlias(sock, chatId, message, 'malaysia');
                commandExecuted = true;
                break;
            case userMessage === '.thailand':
                await piesAlias(sock, chatId, message, 'thailand');
                commandExecuted = true;
                break;
            case userMessage.startsWith('.update'):
                {
                    const parts = rawText.trim().split(/\s+/);
                    const zipArg = parts[1] && parts[1].startsWith('http') ? parts[1] : '';
                    await updateCommand(sock, chatId, message, zipArg);
                }
                commandExecuted = true;
                break;
            case userMessage.startsWith('.removebg') || userMessage.startsWith('.rmbg') || userMessage.startsWith('.nobg'):
                await removebgCommand.exec(sock, message, userMessage.split(' ').slice(1));
                break;
            case userMessage.startsWith('.remini') || userMessage.startsWith('.enhance') || userMessage.startsWith('.upscale'):
                await reminiCommand(sock, chatId, message, userMessage.split(' ').slice(1));
                break;
            case userMessage.startsWith('.sora'):
                await soraCommand(sock, chatId, message);
                break;
            default:
                if (isGroup) {
                    // Handle non-command group messages
                    if (userMessage) {  // Make sure there's a message
                        await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                    }
                    await handleTagDetection(sock, chatId, message, senderId);
                    await handleMentionDetection(sock, chatId, message);
                }
                commandExecuted = false;
                break;
        }

        // If a command was executed, show typing status after command execution
        if (commandExecuted !== false) {
            // Command was executed, now show typing status after command execution
            await showTypingAfterCommand(sock, chatId);
        }

        // Function to handle .groupjid command
        async function groupJidCommand(sock, chatId, message) {
            const groupJid = message.key.remoteJid;

            if (!groupJid.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, {
                    text: "❌ This command can only be used in a group."
                });
            }

            await sock.sendMessage(chatId, {
                text: `✅ Group JID: ${groupJid}`
            }, {
                quoted: message
            });
        }

        if (userMessage.startsWith('.')) {
            // After command is processed successfully
            await addCommandReaction(sock, message);
        }
    } catch (error) {
        console.error('❌ Error in message handler:', error.message);
        // Only try to send error message if we have a valid chatId
        if (chatId) {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to process command!',
                ...channelInfo
            });
        }
    }
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action, author } = update;

        // Check if it's a group
        if (!id.endsWith('@g.us')) return;

        // Respect bot mode: only announce promote/demote in public mode
        let isPublic = true;
        try {
            const modeData = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof modeData.isPublic === 'boolean') isPublic = modeData.isPublic;
        } catch (e) {
            // If reading fails, default to public behavior
        }

        // Handle promotion events
        if (action === 'promote') {
            if (!isPublic) return;
            await handlePromotionEvent(sock, id, participants, author);
            return;
        }

        // Handle demotion events
        if (action === 'demote') {
            if (!isPublic) return;
            await handleDemotionEvent(sock, id, participants, author);
            return;
        }

        // Handle join events
        if (action === 'add') {
            await handleJoinEvent(sock, id, participants);
        }

        // Handle leave events
        if (action === 'remove') return;
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

// Instead, export the handlers along with handleMessages
module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus: async (sock, status) => {
        await handleStatusUpdate(sock, status);
    }
};

