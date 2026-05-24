const songCommand = require('./song');
const { getArgs, getJson } = require('./_downloadUtils');

function withText(message, text) {
    const cloned = { ...message, message: { ...(message.message || {}) } };
    if (cloned.message.conversation !== undefined) {
        cloned.message.conversation = text;
    } else if (cloned.message.extendedTextMessage) {
        cloned.message.extendedTextMessage = { ...cloned.message.extendedTextMessage, text };
    } else {
        cloned.message.conversation = text;
    }
    return cloned;
}

async function resolveSpotifyQuery(input) {
    if (!/open\.spotify\.com/i.test(input)) return input;
    const data = await getJson(`https://open.spotify.com/oembed?url=${encodeURIComponent(input)}`);
    return (data?.title || input)
        .replace(/\s*-\s*song and lyrics by\s*/i, ' ')
        .replace(/\s*\|\s*Spotify\s*$/i, '')
        .trim();
}

module.exports = async function spotifyCommand(sock, chatId, message) {
    const query = getArgs(message);
    if (!query) {
        await sock.sendMessage(chatId, { text: '❌ *Please provide a Spotify song or link!*\nUsage: `.spotify <song name or spotify link>`' }, { quoted: message });
        return;
    }

    try {
        const resolved = await resolveSpotifyQuery(query);
        await songCommand(sock, chatId, withText(message, `.song ${resolved}`));
    } catch (err) {
        await sock.sendMessage(chatId, {
            text: '❌ *Spotify resolve failed!*\n_Try again with a song name: `.spotify faded alan walker`_'
        }, { quoted: message });
    }
};
