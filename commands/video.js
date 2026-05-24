const {
    caption,
    cleanFileName,
    getArgs,
    getYouTubeMedia,
    react,
    resolveYouTube,
    toSmallCaps
} = require('./_downloadUtils');

async function getYoutubeVideo(youtubeUrl) {
    return getYouTubeMedia(youtubeUrl, 'video');
}

async function videoCommand(sock, chatId, message) {
    const query = getArgs(message);
    if (!query) {
        await sock.sendMessage(chatId, {
            text: '❌ *Video name ya YouTube link do!*\n\nUsage: `.video funny cats`'
        }, { quoted: message });
        return;
    }

    await react(sock, message, '⏳');

    try {
        const video = await resolveYouTube(query);
        const waitText = toSmallCaps('downloading video...');

        if (video.thumbnail) {
            await sock.sendMessage(chatId, {
                image: { url: video.thumbnail },
                caption: `🎬 *${video.title}*\n${video.timestamp ? `⏱️ ${video.timestamp}\n` : ''}\n_${waitText}_`
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text: `🎬 *${waitText}*`
            }, { quoted: message });
        }

        const media = await getYoutubeVideo(video.url);
        const title = media.title || video.title || 'youtube video';

        await sock.sendMessage(chatId, {
            video: { url: media.url },
            mimetype: 'video/mp4',
            fileName: `${cleanFileName(title)}.mp4`,
            caption: caption(title)
        }, { quoted: message });

        await react(sock, message, '✅');
    } catch (err) {
        await react(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: `❌ *Video download failed!*\n_${err.message || 'Different link/name se try karo.'}_`
        }, { quoted: message });
    }
}

module.exports = videoCommand;
