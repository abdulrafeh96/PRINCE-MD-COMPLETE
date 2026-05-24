const axios = require('axios');

const fallbackFacts = [
    'Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs.',
    'The first computer bug was an actual real bug — a moth found in a relay.',
    'Bananas are berries, but strawberries are not.'
];

function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
}

module.exports = async function factCommand(sock, chatId, message) {
    try {
        const res = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en', { timeout: 8000 });
        await sock.sendMessage(chatId, { text: `🧠 *Random Fact!*\n\n${res.data.text}` }, { quoted: message });
    } catch {
        await sock.sendMessage(chatId, { text: `🧠 *Random Fact!*\n\n${pick(fallbackFacts)}` }, { quoted: message });
    }
};
