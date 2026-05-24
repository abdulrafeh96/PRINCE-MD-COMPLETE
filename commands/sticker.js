const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

async function getMediaBuffer(message) {
    const direct = message.message || {};
    const type = Object.keys(direct)[0];
    const mediaTypes = ['imageMessage', 'videoMessage', 'documentMessage', 'stickerMessage'];

    if (mediaTypes.includes(type)) {
        return downloadMediaMessage(message, 'buffer', {});
    }

    const contextInfo = direct?.extendedTextMessage?.contextInfo || direct?.[type]?.contextInfo || {};
    const quoted = contextInfo?.quotedMessage;
    if (!quoted) return null;

    const quotedType = Object.keys(quoted)[0];
    if (!mediaTypes.includes(quotedType)) return null;

    const fakeMessage = {
        key: {
            ...message.key,
            id: contextInfo.stanzaId || message.key.id,
            participant: contextInfo.participant
        },
        message: quoted
    };
    return downloadMediaMessage(fakeMessage, 'buffer', {});
}

module.exports = async function stickerCommand(sock, chatId, message) {
    try {
        const buffer = await getMediaBuffer(message);
        if (!buffer) {
            await sock.sendMessage(chatId, {
                text: '❌ *Send or quote an image/video to convert to sticker!*'
            }, { quoted: message });
            return;
        }

        let stickerBuffer = buffer;
        try {
            stickerBuffer = await sharp(buffer)
                .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .webp({ quality: 90 })
                .toBuffer();
        } catch (err) {
            stickerBuffer = buffer;
        }

        await sock.sendMessage(chatId, {
            sticker: stickerBuffer,
            mimetype: 'image/webp',
            packName: '🇦 🇩 🇪 🇪 🇱  🇩 🇪 🇻™',
            author: '🇦 🇩 🇪 🇪 🇱  🇩 🇪 🇻™'
        }, { quoted: message });
    } catch (err) {
        await sock.sendMessage(chatId, {
            text: '❌ *Failed to create sticker!*'
        }, { quoted: message });
    }
};
