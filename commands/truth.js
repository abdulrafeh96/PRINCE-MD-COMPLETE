const truths = [
    'What is the most embarrassing thing you have ever done?',
    'What is your biggest fear in life?',
    'Have you ever lied to your best friend? What about?',
    'What is the worst thing you have ever said to someone?',
    'What is your biggest secret that you never told anyone?',
    'Who do you have a crush on right now?',
    'What is the most childish thing you still do?',
    'Have you ever pretended to be sick to avoid something?'
];

function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
}

async function truthCommand(sock, chatId, message) {
    await sock.sendMessage(chatId, { text: `🤔 *TRUTH!*\n\n${pick(truths)}` }, { quoted: message });
}

module.exports = { truthCommand };
