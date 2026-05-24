const { toSmallCaps } = require('../lib/eddyStyle');

const questions = [
    { q: 'What language is used to style web pages?', a: 'css' },
    { q: 'How many days are there in a leap year?', a: '366' },
    { q: 'What is the capital of Pakistan?', a: 'islamabad' },
    { q: 'Which planet is known as the Red Planet?', a: 'mars' }
];
const games = new Map();

async function startTrivia(sock, chatId, message) {
    const item = questions[Math.floor(Math.random() * questions.length)];
    games.set(chatId, item);
    await sock.sendMessage(chatId, {
        text: `🧠 *${toSmallCaps('trivia started!')}*\n\n❓ ${item.q}\n\n*${toSmallCaps('reply with .answer <answer>')}*`
    }, { quoted: message });
}

async function answerTrivia(sock, chatId, answer, message) {
    const item = games.get(chatId);
    if (!item) {
        await sock.sendMessage(chatId, { text: `❌ *${toSmallCaps('no active trivia. type .trivia')}*` }, { quoted: message });
        return;
    }

    if ((answer || '').trim().toLowerCase() === item.a) {
        games.delete(chatId);
        await sock.sendMessage(chatId, { text: `🎉 *${toSmallCaps('correct answer!')}*` }, { quoted: message });
        return;
    }

    await sock.sendMessage(chatId, { text: `❌ *${toSmallCaps('wrong answer, try again!')}*` }, { quoted: message });
}

module.exports = { startTrivia, answerTrivia };
