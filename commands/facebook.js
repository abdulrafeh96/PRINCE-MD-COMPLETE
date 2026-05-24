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

async function getFacebookVideo(url) {
    return tryApis([
        async () => {
            const d = await getJson(`https://apiskeith.top/download/fbdown?url=${encodeURIComponent(url)}`);
            const mediaUrl = d?.result?.media?.hd || d?.result?.media?.sd || d?.result?.url;
            if (!mediaUrl) throw new Error('Keith FB no media');
            return mediaUrl;
        },
        async () => {
            const d = await getJson(`https://api.agatz.xyz/api/facebook?url=${encodeURIComponent(url)}`);
            const mediaUrl = firstStringDeep(d, ['hd', 'sd', 'url', 'downloadUrl', 'download_url']);
            if (!mediaUrl) throw new Error('Agatz FB no media');
            return mediaUrl;
        },
        async () => {
            const d = await postJson('https://api.cobalt.tools/api/json', { url });
            const mediaUrl = d?.url || d?.picker?.[0]?.url;
            if (!mediaUrl) throw new Error('Cobalt FB no media');
            return mediaUrl;
        }
    ]);
}

module.exports = async function facebookCommand(sock, chatId, message) {
    const url = getArgs(message);
    if (!url || !/(facebook\.com|fb\.watch)/i.test(url)) {
        await sock.sendMessage(chatId, { text: `❌ *${toSmallCaps('provide a facebook video link!')}*` }, { quoted: message });
        return;
    }

    await react(sock, message, '⏳');
    try {
        const mediaUrl = await getFacebookVideo(url);
        const buffer = await getBuffer(mediaUrl, url);
        await sock.sendMessage(chatId, {
            video: buffer,
            mimetype: 'video/mp4',
            caption: caption('facebook video')
        }, { quoted: message });
        await react(sock, message, '✅');
    } catch (err) {
        await react(sock, message, '❌');
        await sock.sendMessage(chatId, { text: `❌ *${toSmallCaps('failed to download facebook video!')}*` }, { quoted: message });
    }
};
