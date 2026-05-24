module.exports = {
    rosedayCommand: async function (sock, chatId, message) {
        await sock.sendMessage(chatId, {
            text: '🌹 *Happy Rose Day!*\n\nMay your day bloom with love, smiles, and soft little moments.'
        }, { quoted: message });
    }
};
