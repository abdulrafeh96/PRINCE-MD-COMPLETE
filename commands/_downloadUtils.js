const axios = require('axios');
const crypto = require('crypto');
const yts = require('yt-search');
const { ytsearch: ruhendSearch } = require('ruhend-scraper');
const { toSmallCaps } = require('../lib/eddyStyle');

const SAVETUBE_KEY = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
const DOWNLOAD_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const http = axios.create({
    timeout: 30000,
    maxContentLength: 120 * 1024 * 1024,
    maxBodyLength: 120 * 1024 * 1024,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json, text/plain, */*'
    }
});

function getText(message) {
    return message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        '';
}

function getArgs(message) {
    return getText(message).trim().split(/\s+/).slice(1).join(' ').trim();
}

function isUrl(text) {
    return /^https?:\/\//i.test(text || '');
}

function isYouTubeUrl(text) {
    return /(?:youtube\.com|youtu\.be|music\.youtube\.com)/i.test(text || '');
}

function extractYouTubeId(text) {
    const input = String(text || '');
    const patterns = [
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/watch\?.*?[?&]?v=([a-zA-Z0-9_-]{11})/,
        /music\.youtube\.com\/watch\?.*?[?&]?v=([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match) return match[1];
    }

    try {
        const url = new URL(input);
        const id = url.searchParams.get('v');
        if (/^[a-zA-Z0-9_-]{11}$/.test(id || '')) return id;
    } catch {}

    return '';
}

function normalizeYouTubeUrl(input) {
    const id = extractYouTubeId(input);
    return id ? `https://www.youtube.com/watch?v=${id}` : input;
}

function cleanFileName(name, fallback = 'download') {
    return String(name || fallback).replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || fallback;
}

async function react(sock, message, emoji) {
    if (!message?.key) return;
    await sock.sendMessage(message.key.remoteJid, { react: { text: emoji, key: message.key } }).catch(() => {});
}

async function resolveYouTube(input) {
    if (isYouTubeUrl(input)) {
        return {
            id: extractYouTubeId(input),
            url: normalizeYouTubeUrl(input),
            title: 'YouTube Media',
            thumbnail: null,
            timestamp: ''
        };
    }

    try {
        const result = await ruhendSearch(input);
        const video = result?.video?.[0] || result?.videos?.[0] || result?.[0];
        const url = video?.url || video?.link || video?.videoUrl;
        if (url) {
            return {
                id: extractYouTubeId(url),
                url: normalizeYouTubeUrl(url),
                title: video.title || 'YouTube Media',
                thumbnail: video.thumbnail || video.image || null,
                timestamp: video.duration || video.timestamp || video.time || ''
            };
        }
    } catch {}

    try {
        const result = await yts(input);
        const video = result?.videos?.[0];
        if (video) {
            return {
                id: extractYouTubeId(video.url),
                url: normalizeYouTubeUrl(video.url),
                title: video.title,
                thumbnail: video.thumbnail,
                timestamp: video.timestamp || ''
            };
        }
    } catch {}

    throw new Error('No YouTube result found');
}

function decryptSaveTubeData(data) {
    const encrypted = Buffer.from(data, 'base64');
    const iv = encrypted.slice(0, 16);
    const payload = encrypted.slice(16);
    const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(SAVETUBE_KEY, 'hex'), iv);
    return JSON.parse(Buffer.concat([decipher.update(payload), decipher.final()]).toString());
}

async function getSaveTubeMedia(youtubeUrl, type = 'audio') {
    const id = extractYouTubeId(youtubeUrl);
    if (!id) throw new Error('Invalid YouTube link');

    const cdnRes = await getJson('https://media.savetube.vip/api/random-cdn');
    const cdn = cdnRes?.cdn;
    if (!cdn) throw new Error('SaveTube CDN not found');

    const headers = {
        'User-Agent': DOWNLOAD_UA,
        Origin: 'https://yt.savetube.me',
        Referer: 'https://yt.savetube.me/'
    };

    const info = await postJson(`https://${cdn}/v2/info`, {
        url: `https://www.youtube.com/watch?v=${id}`
    }, { headers });

    if (!info?.data) throw new Error('SaveTube info failed');
    const details = decryptSaveTubeData(info.data);
    const isAudio = type === 'audio' || type === 'mp3';

    const download = await postJson(`https://${cdn}/download`, {
        id,
        downloadType: isAudio ? 'audio' : 'video',
        quality: isAudio ? '128' : '360',
        key: details.key
    }, { headers });

    const url = download?.data?.downloadUrl || download?.downloadUrl || firstStringDeep(download, ['downloadUrl', 'download_url', 'url', 'link']);
    if (!url) throw new Error('SaveTube download URL not found');

    return {
        url,
        title: details.title || 'YouTube Media',
        thumbnail: details.thumbnail || null,
        id
    };
}

async function getYouTubeMedia(youtubeUrl, type = 'audio') {
    return tryApis([
        () => getSaveTubeMedia(youtubeUrl, type)
    ]);
}

async function isReachableUrl(url) {
    try {
        const res = await http.head(url, {
            timeout: 15000,
            maxRedirects: 5,
            validateStatus: status => status >= 200 && status < 400
        });
        return !!res.status;
    } catch {
        return false;
    }
}

function firstStringDeep(value, keys = []) {
    if (!value) return '';
    if (typeof value === 'string' && /^https?:\/\//i.test(value)) return value;
    if (Array.isArray(value)) {
        for (const item of value) {
            const found = firstStringDeep(item, keys);
            if (found) return found;
        }
        return '';
    }
    if (typeof value === 'object') {
        for (const key of keys) {
            const v = value[key];
            if (typeof v === 'string' && /^https?:\/\//i.test(v)) return v;
        }
        for (const v of Object.values(value)) {
            const found = firstStringDeep(v, keys);
            if (found) return found;
        }
    }
    return '';
}

async function tryApis(apis) {
    const errors = [];
    for (const api of apis) {
        try {
            const result = await api();
            if (result) return result;
        } catch (err) {
            errors.push(err.message);
        }
    }
    throw new Error(errors.find(Boolean) || 'All APIs failed');
}

async function getJson(url, options = {}) {
    const res = await http.get(url, options);
    return res.data;
}

async function postJson(url, data, options = {}) {
    const res = await http.post(url, data, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    return res.data;
}

async function getBuffer(url, referer) {
    const res = await http.get(url, {
        responseType: 'arraybuffer',
        timeout: 90000,
        headers: {
            Accept: '*/*',
            ...(referer ? { Referer: referer } : {})
        }
    });
    const buffer = Buffer.from(res.data);
    if (!buffer.length) throw new Error('Empty media buffer');
    return buffer;
}

function caption(title) {
    return `*${toSmallCaps(title)}*\n\n> ${toSmallCaps('downloaded successfully')}\n> ${toSmallCaps('by Adeel Dev')}`;
}

module.exports = {
    caption,
    cleanFileName,
    extractYouTubeId,
    firstStringDeep,
    getArgs,
    getBuffer,
    getJson,
    getText,
    getSaveTubeMedia,
    getYouTubeMedia,
    isUrl,
    isReachableUrl,
    isYouTubeUrl,
    normalizeYouTubeUrl,
    postJson,
    react,
    resolveYouTube,
    toSmallCaps,
    tryApis
};
