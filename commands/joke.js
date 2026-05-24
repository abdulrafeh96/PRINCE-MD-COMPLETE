const axios = require('axios');

const fallbackJokes = [
    'Why do programmers prefer dark mode?\nBecause light attracts bugs! 🐛',
    'Why did the bot go to school?\nTo improve its "neural" network! 🤖',
    'I told my computer I needed a break...\nNow it won\'t stop sending me Kit-Kat ads! 😂'
];

function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
}

module.exports = async function jokeCommand(sock, chatId, message) {
    try {
        const res = await axios.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist&type=twopart', { timeout: 8000 });
        const data = res.data;
        const text = data.type === 'twopart'
            ? `😂 *Joke Time!*\n\n❓ ${data.setup}\n\n💡 ${data.delivery}`
            : `😂 *Joke Time!*\n\n${data.joke}`;
        await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: `😂 *Joke Time!*\n\n${pick(fallbackJokes)}` }, { quoted: message });
    }
};
