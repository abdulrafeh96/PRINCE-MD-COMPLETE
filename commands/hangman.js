const { toSmallCaps } = require('../lib/eddyStyle');

const games = new Map();
const words = ['whatsapp', 'eddy', 'coding', 'javascript', 'developer', 'telegram', 'python', 'internet', 'computer'];

function renderGame(game) {
    return game.word.split('').map(letter => game.guessed.has(letter) ? letter : '_').join(' ');
}

async function startHangman(sock, chatId, message) {
    if (games.has(chatId)) {
        await sock.sendMessage(chatId, { text: `⚠️ *${toSmallCaps('game already running')}*` }, { quoted: message });
        return;
    }

    const word = words[Math.floor(Math.random() * words.length)];
    games.set(chatId, {
        word,
        guessed: new Set(),
        lives: 6
    });

    await sock.sendMessage(chatId, {
        text: `🎮 *${toSmallCaps('hangman started!')}*\n\n*${toSmallCaps('word')}:* ${'_ '.repeat(word.length).trim()}\n*${toSmallCaps('lives')}:* 6\n\n*${toSmallCaps('reply with .guess [letter] to play')}*`
    }, { quoted: message });
}

async function guessLetter(sock, chatId, letter, message) {
    const game = games.get(chatId);
    if (!game) {
        await sock.sendMessage(chatId, { text: `❌ *${toSmallCaps('no active game. type .hangman')}*` }, { quoted: message });
        return;
    }

    const char = (letter || '').trim().toLowerCase()[0];
    if (!char || char.length !== 1) {
        await sock.sendMessage(chatId, { text: `❌ *${toSmallCaps('guess a single letter')}*` }, { quoted: message });
        return;
    }
    if (game.guessed.has(char)) {
        await sock.sendMessage(chatId, { text: `⚠️ *${toSmallCaps('already guessed')}*` }, { quoted: message });
        return;
    }

    game.guessed.add(char);
    if (!game.word.includes(char)) game.lives -= 1;

    const display = renderGame(game);
    if (game.lives <= 0) {
        games.delete(chatId);
        await sock.sendMessage(chatId, { text: `💀 *${toSmallCaps('game over! word was')}:* ${game.word}` }, { quoted: message });
        return;
    }

    if (!display.includes('_')) {
        games.delete(chatId);
        await sock.sendMessage(chatId, { text: `🎉 *${toSmallCaps('you won! word was')}:* ${game.word}` }, { quoted: message });
        return;
    }

    await sock.sendMessage(chatId, {
        text: `*${toSmallCaps('progress')}:* ${display}\n*${toSmallCaps('lives')}:* ${game.lives}\n*${toSmallCaps('guessed')}:* ${[...game.guessed].join(', ')}`
    }, { quoted: message });
}

module.exports = {
    startHangman,
    guessLetter
};
