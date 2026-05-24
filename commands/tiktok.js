const { ttdl } = require('ruhend-scraper');
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

const processedMessages = new Set();

function cleanUsername(input = '') {
    return String(input)
        .replace(/^https?:\/\/(?:www\.)?tiktok\.com\/@?/i, '')
        .replace(/^@/, '')
        .split(/[/?#\s]/)[0]
        .trim();
}

function formatNumber(value) {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number.toLocaleString('en-US') : '0';
}

function yesNo(value) {
    return value ? 'Yes' : 'No';
}

async function getTikTokMedia(url) {
    return tryApis([
        async () => {
            const d = await getJson(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const mediaUrl = d?.data?.play || d?.data?.wmplay || d?.data?.hdplay;
            if (!mediaUrl) throw new Error('TikWM no media');
            return { url: mediaUrl, title: d?.data?.title || 'TikTok Video' };
        },
        async () => {
            const d = await getJson(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`);
            const mediaUrl = d?.data?.urls?.[0] || d?.data?.video_url || d?.data?.url || d?.data?.download_url;
            if (!mediaUrl) throw new Error('Siputzx TT no media');
            return { url: mediaUrl, title: d?.data?.metadata?.title || 'TikTok Video' };
        },
        async () => {
            const d = await postJson('https://api.cobalt.tools/api/json', { url });
            const mediaUrl = d?.url || d?.picker?.[0]?.url;
            if (!mediaUrl) throw new Error('Cobalt TT no media');
            return { url: mediaUrl, title: 'TikTok Video' };
        },
        async () => {
            const d = await ttdl(url);
            const mediaUrl = d?.data?.find(item => item.url)?.url || firstStringDeep(d, ['url']);
            if (!mediaUrl) throw new Error('ruhend TT no media');
            return { url: mediaUrl, title: 'TikTok Video' };
        }
    ]);
}

async function getTikTokProfile(username) {
    const clean = cleanUsername(username);
    if (!clean) throw new Error('username missing');

    const data = await getJson(`https://www.tikwm.com/api/user/info?unique_id=${encodeURIComponent(clean)}`);
    if (data?.code !== 0 || !data?.data?.user) {
        throw new Error(data?.msg || 'TikTok user not found');
    }

    return data.data;
}

function buildProfileCaption(profile) {
    const user = profile.user || {};
    const stats = profile.stats || {};
    const created = user.createTime
        ? new Date(user.createTime * 1000).toLocaleDateString('en-US')
        : 'Unknown';
    const bioLink = user.bioLink?.link || user.bioLink?.risk || '';

    return [
        `🎵 *${toSmallCaps('tiktok profile details')}*`,
        '',
        `👤 *${toSmallCaps('name')}:* ${user.nickname || 'N/A'}`,
        `🔖 *${toSmallCaps('username')}:* @${user.uniqueId || 'N/A'}`,
        `🆔 *${toSmallCaps('id')}:* ${user.id || 'N/A'}`,
        `✅ *${toSmallCaps('verified')}:* ${yesNo(user.verified)}`,
        `🔒 *${toSmallCaps('private')}:* ${yesNo(user.privateAccount || user.secret)}`,
        `📅 *${toSmallCaps('created')}:* ${created}`,
        '',
        `👥 *${toSmallCaps('followers')}:* ${formatNumber(stats.followerCount)}`,
        `➡️ *${toSmallCaps('following')}:* ${formatNumber(stats.followingCount)}`,
        `❤️ *${toSmallCaps('likes')}:* ${formatNumber(stats.heartCount || stats.heart)}`,
        `🎬 *${toSmallCaps('videos')}:* ${formatNumber(stats.videoCount)}`,
        '',
        `📝 *${toSmallCaps('bio')}:* ${user.signature || 'N/A'}`,
        bioLink ? `🔗 *${toSmallCaps('bio link')}:* ${bioLink}` : '',
        `🌐 *${toSmallCaps('profile')}:* https://www.tiktok.com/@${user.uniqueId || ''}`
    ].filter(Boolean).join('\n');
}

async function sendTikTokProfile(sock, chatId, message, username) {
    await react(sock, message, '⏳');
    const profile = await getTikTokProfile(username);
    const user = profile.user || {};
    const avatar = user.avatarLarger || user.avatarMedium || user.avatarThumb;
    const captionText = buildProfileCaption(profile);

    if (avatar) {
        await sock.sendMessage(chatId, {
            image: { url: avatar },
            caption: captionText
        }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, { text: captionText }, { quoted: message });
    }
    await react(sock, message, '✅');
}

module.exports = async function tiktokCommand(sock, chatId, message) {
    if (processedMessages.has(message.key.id)) return;
    processedMessages.add(message.key.id);
    setTimeout(() => processedMessages.delete(message.key.id), 5 * 60 * 1000);

    const rawArg = getArgs(message);
    const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        '';
    const command = text.trim().split(/\s+/)[0]?.toLowerCase() || '';

    if (!rawArg) {
        await sock.sendMessage(chatId, {
            text:
`❌ *${toSmallCaps('please provide a tiktok username or link')}*

${toSmallCaps('profile details')}: \`.ttstalk tiktok\`
${toSmallCaps('video download')}: \`.tiktok <link>\``
        }, { quoted: message });
        return;
    }

    const isStalkCommand = ['.ttstalk', '.tiktokstalk', '.tiktokstalker', '.ttinfo'].includes(command);
    const isTikTokLink = /tiktok\.com/i.test(rawArg);

    if (isStalkCommand || !isTikTokLink) {
        try {
            await sendTikTokProfile(sock, chatId, message, rawArg);
        } catch (err) {
            await react(sock, message, '❌');
            await sock.sendMessage(chatId, {
                text: `❌ *${toSmallCaps('tiktok profile not found')}*\n_${err.message || 'check the username'}_`
            }, { quoted: message });
        }
        return;
    }

    await react(sock, message, '⏳');
    try {
        const media = await getTikTokMedia(rawArg);
        const buffer = await getBuffer(media.url, rawArg);
        await sock.sendMessage(chatId, {
            video: buffer,
            mimetype: 'video/mp4',
            caption: caption(media.title || 'tiktok video')
        }, { quoted: message });
        await react(sock, message, '✅');
    } catch (err) {
        await react(sock, message, '❌');
        await sock.sendMessage(chatId, {
            text: `❌ *${toSmallCaps('failed to download tiktok!')}*`
        }, { quoted: message });
    }
};
