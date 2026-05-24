const {
    caption,
    firstStringDeep,
    getArgs,
    getBuffer,
    getJson,
    postJson,
    react,
    toSmallCaps,
    tryApis
} = require('./_downloadUtils');

async function getInstagramMedia(url) {
    return tryApis([
        async () => {
            const d = await getJson(`https://igdownloader-five.vercel.app/download?url=${encodeURIComponent(url)}&key=tlz.vercel.app`);
            const mediaUrl = d?.video_url || d?.thumbnail_url || d?.url;
            if (!mediaUrl) throw new Error('IG downloader no media');
            return { url: mediaUrl, isVideo: Boolean(d?.video_url) || /\.mp4/i.test(mediaUrl) };
        },
        async () => {
            const d = await getJson(`https://api.agatz.xyz/api/instagram?url=${encodeURIComponent(url)}`);
            const mediaUrl = firstStringDeep(d, ['url', 'downloadUrl', 'download_url', 'video', 'image']);
            if (!mediaUrl) throw new Error('Agatz IG no media');
            return { url: mediaUrl, isVideo: /\.mp4/i.test(mediaUrl) };
        },
        async () => {
            const d = await postJson('https://api.cobalt.tools/api/json', { url });
            const mediaUrl = d?.url || d?.picker?.[0]?.url;
            if (!mediaUrl) throw new Error('Cobalt IG no media');
            return { url: mediaUrl, isVideo: d?.type !== 'photo' && !/\.(jpg|jpeg|png|webp)(\?|$)/i.test(mediaUrl) };
        }
    ]);
}

module.exports = async function instagramCommand(sock, chatId, message) {
    const url = getArgs(message);
    if (!url || !/instagram\.com/i.test(url)) {
        await sock.sendMessage(chatId, { text: `❌ *${toSmallCaps('provide an instagram link!')}*` }, { quoted: message });
        return;
    }

    await react(sock, message, '⏳');
    try {
        const media = await getInstagramMedia(url);
        const buffer = await getBuffer(media.url, url);
        if (media.isVideo) {
            await sock.sendMessage(chatId, {
                video: buffer,
                mimetype: 'video/mp4',
                caption: caption('instagram video')
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                image: buffer,
                caption: caption('instagram photo')
            }, { quoted: message });
        }
        await react(sock, message, '✅');
    } catch (err) {
        await react(sock, message, '❌');
        await sock.sendMessage(chatId, { text: `❌ *${toSmallCaps('failed to download instagram media!')}*` }, { quoted: message });
    }
};
