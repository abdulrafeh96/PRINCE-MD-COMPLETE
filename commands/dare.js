const dares = [
    'Send a voice note saying "I am the best!" 3 times.',
    'Tag 3 people and tell them they are amazing!',
    'Change your status to "I love bots" for 10 minutes.',
    'Send your most embarrassing selfie in the chat.',
    'Type a paragraph with your eyes closed.',
    'Speak only in emojis for the next 5 messages.',
    'Tell a joke — if no one laughs, do another dare.',
    'Send a GIF that describes your personality.'
];

function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
}

async function dareCommand(sock, chatId, message) {
    await sock.sendMessage(chatId, { text: `😈 *DARE!*\n\n${pick(dares)}` }, { quoted: message });
}

module.exports = { dareCommand };
