const responses = [
    '✅ It is certain.',
    '✅ It is decidedly so.',
    '✅ Without a doubt.',
    '✅ Yes definitely.',
    '✅ You may rely on it.',
    '🟡 Reply hazy, try again.',
    '🟡 Ask again later.',
    '🟡 Better not tell you now.',
    '🟡 Cannot predict now.',
    '❌ Don\'t count on it.',
    '❌ My reply is no.',
    '❌ My sources say no.',
    '❌ Outlook not so good.',
    '❌ Very doubtful.'
];

function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
}

async function eightBallCommand(sock, chatId, question = '', message) {
    const text = String(question || '').trim();
    if (!text) {
        await sock.sendMessage(chatId, { text: '❌ *Ask a question!*\nUsage: `.8ball Will I be rich?`' }, { quoted: message });
        return;
    }

    await sock.sendMessage(chatId, {
        text: `🎱 *Magic 8 Ball*\n\n❓ *Q:* ${text}\n\n💬 *A:* ${pick(responses)}`
    }, { quoted: message });
}

module.exports = { eightBallCommand };
