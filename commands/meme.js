const axios = require('axios');

module.exports = async function memeCommand(sock, chatId, message) {
    try {
        const { data } = await axios.get('https://meme-api.com/gimme', { timeout: 10000 });
        await sock.sendMessage(chatId, {
            image: { url: data.url },
            caption: `😂 *Meme Time!*\n\n${data.title || ''}`
        }, { quoted: message });
    } catch (err) {
        await sock.sendMessage(chatId, { text: '❌ *Meme fetch failed!*' }, { quoted: message });
    }
};
