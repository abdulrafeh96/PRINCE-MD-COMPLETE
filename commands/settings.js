const fs = require('fs');
const isOwnerOrSudo = require('../lib/isOwner');

function readJsonSafe(path, fallback) {
    try {
        const txt = fs.readFileSync(path, 'utf8');
        return JSON.parse(txt);
    } catch (_) {
        return fallback;
    }
}

function status(value) {
    return value ? 'ON' : 'OFF';
}

async function settingsCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { text: 'Only bot owner can use this command!' }, { quoted: message });
            return;
        }

        const isGroup = chatId.endsWith('@g.us');
        const dataDir = './data';

        const mode = readJsonSafe(`${dataDir}/messageCount.json`, { isPublic: true });
        const autoStatus = readJsonSafe(`${dataDir}/autoStatus.json`, { enabled: false });
        const autoread = readJsonSafe(`${dataDir}/autoread.json`, { enabled: false });
        const autotyping = readJsonSafe(`${dataDir}/autotyping.json`, { enabled: false });
        const pmblocker = readJsonSafe(`${dataDir}/pmblocker.json`, { enabled: false });
        const anticall = readJsonSafe(`${dataDir}/anticall.json`, { enabled: false });
        const userGroupData = readJsonSafe(`${dataDir}/userGroupData.json`, {
            antilink: {},
            antibadword: {},
            welcome: {},
            chatbot: {},
            antitag: {},
            antisticker: {},
            antichannel: {},
            schedule: {}
        });
        const autoReaction = Boolean(userGroupData.autoReaction);

        const groupId = isGroup ? chatId : null;
        const antilinkCfg = groupId ? userGroupData.antilink?.[groupId] : null;
        const antibadwordCfg = groupId ? userGroupData.antibadword?.[groupId] : null;
        const welcomeOn = groupId ? Boolean(userGroupData.welcome?.[groupId]) : false;
        const chatbotOn = groupId ? Boolean(userGroupData.chatbot?.[groupId]) : false;
        const antitagCfg = groupId ? userGroupData.antitag?.[groupId] : null;
        const antistickerCfg = groupId ? userGroupData.antisticker?.[groupId] : null;
        const antichannelCfg = groupId ? userGroupData.antichannel?.[groupId] : null;
        const scheduleCfg = groupId ? userGroupData.schedule?.[groupId] : null;

        const lines = [
            '*BOT SETTINGS*',
            '',
            `• Mode: ${mode.isPublic ? 'Public' : 'Private'}`,
            `• Auto Status: ${status(autoStatus.enabled)}`,
            `• Autoread: ${status(autoread.enabled)}`,
            `• Autotyping: ${status(autotyping.enabled)}`,
            `• PM Blocker: ${status(pmblocker.enabled)}`,
            `• Anticall: ${status(anticall.enabled)}`,
            `• Auto Reaction: ${status(autoReaction)}`
        ];

        if (groupId) {
            lines.push('');
            lines.push(`Group: ${groupId}`);
            lines.push(antilinkCfg ? `• Antilink: ON (action: ${antilinkCfg.action || 'delete'})` : '• Antilink: OFF');
            lines.push(antibadwordCfg ? `• Antibadword: ON (action: ${antibadwordCfg.action || 'delete'})` : '• Antibadword: OFF');
            lines.push(`• Welcome: ${status(welcomeOn)}`);
            lines.push(`• Chatbot: ${status(chatbotOn)}`);
            lines.push(antitagCfg?.enabled ? `• Antitag: ON (action: ${antitagCfg.action || 'delete'})` : '• Antitag: OFF');
            lines.push(antistickerCfg?.enabled ? `• Antisticker: ON (action: ${antistickerCfg.action || 'delete'})` : '• Antisticker: OFF');
            lines.push(antichannelCfg?.enabled ? `• Antichannel: ON (action: ${antichannelCfg.action || 'delete'})` : '• Antichannel: OFF');
            lines.push(scheduleCfg?.enabled ? `• Schedule: ON (open: ${scheduleCfg.openTime || 'not set'}, close: ${scheduleCfg.closeTime || 'not set'})` : '• Schedule: OFF');
        } else {
            lines.push('');
            lines.push('Note: Per-group settings will be shown when used inside a group.');
        }

        await sock.sendMessage(chatId, { text: lines.join('\n') }, { quoted: message });
    } catch (error) {
        console.error('Error in settings command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to read settings.' }, { quoted: message });
    }
}

module.exports = settingsCommand;
