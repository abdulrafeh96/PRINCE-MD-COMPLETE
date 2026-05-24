const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const style = require('../lib/eddyStyle');

async function ensureGroupAndAdmin(sock, chatId, senderId) {
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) {
        await sock.sendMessage(chatId, { text: style.fail('this command can only be used in groups') });
        return { ok: false };
    }
    // Check admin status of sender and bot
    const isAdmin = require('../lib/isAdmin');
    const adminStatus = await isAdmin(sock, chatId, senderId);
    if (!adminStatus.isBotAdmin) {
        await sock.sendMessage(chatId, { text: style.fail('please make the bot an admin first') });
        return { ok: false };
    }
    if (!adminStatus.isSenderAdmin) {
        await sock.sendMessage(chatId, { text: style.fail('only group admins can use this command') });
        return { ok: false };
    }
    return { ok: true };
}

async function setGroupDescription(sock, chatId, senderId, text, message) {
    const check = await ensureGroupAndAdmin(sock, chatId, senderId);
    if (!check.ok) return;
    const desc = (text || '').trim();
    if (!desc) {
        await sock.sendMessage(chatId, { text: style.usage('usage', ['.setgdesc <description>']) }, { quoted: message });
        return;
    }
    try {
        await sock.groupUpdateDescription(chatId, desc);
        await sock.sendMessage(chatId, { text: style.ok('group description updated') }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: style.fail('failed to update group description') }, { quoted: message });
    }
}

async function setGroupName(sock, chatId, senderId, text, message) {
    const check = await ensureGroupAndAdmin(sock, chatId, senderId);
    if (!check.ok) return;
    const name = (text || '').trim();
    if (!name) {
        await sock.sendMessage(chatId, { text: style.usage('usage', ['.setgname <new name>']) }, { quoted: message });
        return;
    }
    try {
        await sock.groupUpdateSubject(chatId, name);
        await sock.sendMessage(chatId, { text: style.ok('group name updated') }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: style.fail('failed to update group name') }, { quoted: message });
    }
}

async function setGroupPhoto(sock, chatId, senderId, message) {
    const check = await ensureGroupAndAdmin(sock, chatId, senderId);
    if (!check.ok) return;

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMessage = quoted?.imageMessage || quoted?.stickerMessage;
    if (!imageMessage) {
        await sock.sendMessage(chatId, { text: style.warn('reply to an image/sticker with .setgpp') }, { quoted: message });
        return;
    }
    try {
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const imgPath = path.join(tmpDir, `gpp_${Date.now()}.jpg`);
        fs.writeFileSync(imgPath, buffer);

        await sock.updateProfilePicture(chatId, { url: imgPath });
        try { fs.unlinkSync(imgPath); } catch (_) {}
        await sock.sendMessage(chatId, { text: style.ok('group profile photo updated') }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: style.fail('failed to update group profile photo') }, { quoted: message });
    }
}

module.exports = {
    setGroupDescription,
    setGroupName,
    setGroupPhoto
};
