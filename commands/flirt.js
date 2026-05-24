const lines = [
    'Are you WiFi? Because I am feeling a strong connection.',
    'You must be a keyboard, because you are just my type.',
    'If beauty was code, you would be production ready.',
    'Your smile has better uptime than my server.'
];

module.exports = {
    flirtCommand: async function (sock, chatId, message) {
        const line = lines[Math.floor(Math.random() * lines.length)];
        await sock.sendMessage(chatId, { text: `💘 *Flirt Line!*\n\n${line}` }, { quoted: message });
    }
};
