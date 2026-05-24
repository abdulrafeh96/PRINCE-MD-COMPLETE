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

function isPinterestLink(text = '') {
    return /(?:pin\.it|pinterest\.[a-z.]+|www\.pinterest\.com)/i.test(text);
}

function uniqueByUrl(items) {
    const seen = new Set();
    return items.filter((item) => {
        const url = item.url || item.video_url || item.image_url;
        if (!url || seen.has(url)) return false;
        seen.add(url);
        return true;
    });
}

function itemTitle(item, fallback) {
    return item.description || item.grid_title || item.seo_alt_text || fallback;
}

async function getPinterestMedia(url) {
    return tryApis([
        async () => {
            const d = await getJson(`https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(url)}`);
            const mediaUrl = firstStringDeep(d, ['video_url', 'image_url', 'url', 'downloadUrl', 'download_url', 'video', 'image']);
            if (!mediaUrl) throw new Error('Siputzx Pinterest no media');
            return { url: mediaUrl, isVideo: /\.mp4/i.test(mediaUrl) || d?.data?.type === 'video' };
        },
        async () => {
            const d = await getJson(`https://api.agatz.xyz/api/pinterestdl?url=${encodeURIComponent(url)}`);
            const mediaUrl = firstStringDeep(d, ['url', 'downloadUrl', 'download_url', 'video', 'image']);
            if (!mediaUrl) throw new Error('Agatz Pinterest no media');
            return { url: mediaUrl, isVideo: /\.mp4/i.test(mediaUrl) };
        },
        async () => {
            const d = await postJson('https://pinterest-downloader-api.vercel.app/api/download', { url });
            const mediaUrl = d?.download_url || d?.media_url || d?.url || d?.data?.url;
            if (!mediaUrl) throw new Error('Pinterest API no media');
            return { url: mediaUrl, isVideo: d?.type === 'video' || /\.mp4/i.test(mediaUrl) };
        },
        async () => {
            const html = await getJson(url, { responseType: 'text' });
            const video = String(html).match(/"video_url":"([^"]+)"/)?.[1];
            const image = String(html).match(/"url":"([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i)?.[1];
            const mediaUrl = (video || image || '').replace(/\\u002F/g, '/');
            if (!mediaUrl) throw new Error('Pinterest scrape no media');
            return { url: mediaUrl, isVideo: Boolean(video) };
        }
    ]);
}

async function searchPinterest(query) {
    const data = await getJson(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}`);
    const results = Array.isArray(data?.data) ? data.data : [];
    if (!results.length) throw new Error('No Pinterest results');
    return results;
}

async function getPinterestSearchPack(query) {
    const [general, videos] = await Promise.allSettled([
        searchPinterest(query),
        searchPinterest(`${query} video`)
    ]);

    const all = [
        ...(general.status === 'fulfilled' ? general.value : []),
        ...(videos.status === 'fulfilled' ? videos.value : [])
    ];

    const videoItems = uniqueByUrl(all
        .filter((item) => item.video_url)
        .map((item) => ({
            ...item,
            url: item.video_url,
            type: 'video'
        })))
        .slice(0, 3);

    const imageItems = uniqueByUrl(all
        .filter((item) => item.image_url)
        .map((item) => ({
            ...item,
            url: item.image_url,
            type: 'image'
        })))
        .slice(0, 3);

    return { videoItems, imageItems };
}

async function sendPinterestSearch(sock, chatId, message, query) {
    const { videoItems, imageItems } = await getPinterestSearchPack(query);
    const total = videoItems.length + imageItems.length;
    if (!total) throw new Error('No media found');

    await sock.sendMessage(chatId, {
        text:
`📌 *${toSmallCaps('pinterest results')}*

${toSmallCaps('query')}: ${query}
${toSmallCaps('sending')}: ${videoItems.length} ${toSmallCaps('videos')} + ${imageItems.length} ${toSmallCaps('pics')}`
    }, { quoted: message });

    for (const [index, item] of videoItems.entries()) {
        await sock.sendMessage(chatId, {
            video: { url: item.url },
            mimetype: 'video/mp4',
            caption:
`📌 *${toSmallCaps('pinterest video')} ${index + 1}/3*
${itemTitle(item, query)}`
        }, { quoted: message });
    }

    for (const [index, item] of imageItems.entries()) {
        await sock.sendMessage(chatId, {
            image: { url: item.url },
            caption:
`📌 *${toSmallCaps('pinterest pic')} ${index + 1}/3*
${itemTitle(item, query)}`
        }, { quoted: message });
    }
}

module.exports = async function pinterestCommand(sock, chatId, message) {
    const input = getArgs(message);
    if (!input) {
        await sock.sendMessage(chatId, {
            text:
`❌ *${toSmallCaps('please provide a pinterest query or link')}*

${toSmallCaps('examples')}:
.pin aesthetic
.pinterest cars
.pindl <pinterest link>`
        }, { quoted: message });
        return;
    }

    await react(sock, message, '⏳');

    try {
        if (!isPinterestLink(input)) {
            await sendPinterestSearch(sock, chatId, message, input);
            await react(sock, message, '✅');
            return;
        }

        const media = await getPinterestMedia(input);
        const buffer = await getBuffer(media.url, input);
        if (media.isVideo) {
            await sock.sendMessage(chatId, {
                video: buffer,
                mimetype: 'video/mp4',
                caption: caption('pinterest video')
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                image: buffer,
                caption: caption('pinterest image')
            }, { quoted: message });
        }
        await react(sock, message, '✅');
    } catch (err) {
        await react(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: `❌ *${toSmallCaps('failed to fetch pinterest media!')}*\n_${err.message || 'try another query/link'}_`
        }, { quoted: message });
    }
};
