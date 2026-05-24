const lines = [
    'You bring everyone so much joy... when you leave the chat.',
    'You have something special. Usually it is lag.',
    'Your confidence has no relation to your accuracy.',
    'You are proof that typing fast and thinking fast are different skills.'
];

module.exports = {
    insultCommand: async function (sock, chatId, message) {
        const line = lines[Math.floor(Math.random() * lines.length)];
        await sock.sendMessage(chatId, { text: `😈 *Roast Time!*\n\n${line}` }, { quoted: message });
    }
};
