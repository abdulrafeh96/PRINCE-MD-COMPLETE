const {
    cleanFileName,
    getArgs,
    getYouTubeMedia,
    react,
    resolveYouTube,
    toSmallCaps
} = require('./_downloadUtils');

async function getYoutubeAudio(youtubeUrl) {
    return getYouTubeMedia(youtubeUrl, 'audio');
}

async function songCommand(sock, chatId, message) {
    const query = getArgs(message);
    if (!query) {
        await sock.sendMessage(chatId, {
            text: '❌ *Song name ya YouTube link do!*\n\nUsage: `.song faded alan walker`'
        }, { quoted: message });
        return;
    }

    await react(sock, message, '⏳');

    try {
        const video = await resolveYouTube(query);
        const waitText = toSmallCaps('downloading audio...');

        if (video.thumbnail) {
            await sock.sendMessage(chatId, {
                image: { url: video.thumbnail },
                caption: `🎵 *${video.title}*\n${video.timestamp ? `⏱️ ${video.timestamp}\n` : ''}\n_${waitText}_`
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text: `🎵 *${waitText}*`
            }, { quoted: message });
        }

        const audio = await getYoutubeAudio(video.url);

        await sock.sendMessage(chatId, {
            audio: { url: audio.url },
            mimetype: 'audio/mpeg',
            fileName: `${cleanFileName(audio.title || video.title || 'song')}.mp3`,
            ptt: false
        }, { quoted: message });

        await react(sock, message, '✅');
    } catch (err) {
        await react(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: `❌ *Audio download failed!*\n_${err.message || 'Different link/name se try karo.'}_`
        }, { quoted: message });
    }
}

module.exports = songCommand;
