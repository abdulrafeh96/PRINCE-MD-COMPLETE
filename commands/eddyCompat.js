const axios = require('axios');
const QRCode = require('qrcode');

const smallCapsMap = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};

function toSmallCaps(text) {
    return String(text || '').split('').map(ch => smallCapsMap[ch.toLowerCase()] || ch).join('');
}

function arg(rawText) {
    return (rawText || '').trim().split(/\s+/).slice(1).join(' ').trim();
}

function firstArg(rawText) {
    return arg(rawText).split(/\s+/)[0] || '';
}

function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
}

async function reply(sock, chatId, message, text, extra = {}) {
    await sock.sendMessage(chatId, { text, ...extra }, { quoted: message });
}

async function qr(sock, chatId, message, rawText) {
    const text = arg(rawText);
    if (!text) return reply(sock, chatId, message, '❌ *Provide text/link!*\nUsage: `.qr <text/link>`');
    const buffer = await QRCode.toBuffer(text, { type: 'png', width: 420, margin: 2 });
    await sock.sendMessage(chatId, {
        image: buffer,
        caption: `*QR Code Generated*\n\n${text}\n\n> ${toSmallCaps('powered by Prince Md')}`
    }, { quoted: message });
}

async function shorturl(sock, chatId, message, rawText) {
    const url = firstArg(rawText);
    if (!/^https?:\/\//i.test(url)) return reply(sock, chatId, message, '❌ *Valid URL do!*\nUsage: `.shorturl https://example.com`');
    const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 10000 });
    await reply(sock, chatId, message, `*URL Shortened*\n\nOriginal: ${url}\nShort: ${res.data}`);
}

async function wiki(sock, chatId, message, rawText) {
    const query = arg(rawText);
    if (!query) return reply(sock, chatId, message, '❌ *Topic do!*\nUsage: `.wiki <topic>`');
    const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, { timeout: 10000 });
    const data = res.data;
    await reply(sock, chatId, message, `*Wikipedia*\n\n*${data.title || query}*\n\n${(data.extract || 'No summary found.').slice(0, 900)}\n\n${data.content_urls?.desktop?.page || ''}`);
}

async function google(sock, chatId, message, rawText) {
    const query = arg(rawText);
    if (!query) return reply(sock, chatId, message, '❌ *Search query do!*\nUsage: `.google <search>`');
    await reply(sock, chatId, message, `*Google Search*\n\n${query}\n\nhttps://www.google.com/search?q=${encodeURIComponent(query)}`);
}

async function image(sock, chatId, message, rawText) {
    const query = arg(rawText);
    if (!query) return reply(sock, chatId, message, '❌ *Image search query do!*\nUsage: `.image <search>`');
    await reply(sock, chatId, message, `*Image Search*\n\n${query}\n\nhttps://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`);
}

function getCountryFromNumber(number) {
    const countries = {
        '92': ['Pakistan', '+92', 'Asia/Karachi', 'PKR'],
        '91': ['India', '+91', 'Asia/Kolkata', 'INR'],
        '1': ['USA/Canada', '+1', 'America/New_York', 'USD'],
        '44': ['United Kingdom', '+44', 'Europe/London', 'GBP'],
        '49': ['Germany', '+49', 'Europe/Berlin', 'EUR'],
        '33': ['France', '+33', 'Europe/Paris', 'EUR'],
        '81': ['Japan', '+81', 'Asia/Tokyo', 'JPY'],
        '86': ['China', '+86', 'Asia/Shanghai', 'CNY'],
        '971': ['UAE', '+971', 'Asia/Dubai', 'AED'],
        '966': ['Saudi Arabia', '+966', 'Asia/Riyadh', 'SAR']
    };
    const code = Object.keys(countries).sort((a, b) => b.length - a.length).find(c => number.startsWith(c));
    const data = countries[code] || ['Unknown', 'Unknown', 'Unknown', 'Unknown'];
    return { country: data[0], code: data[1], timezone: data[2], currency: data[3] };
}

function getOperatorFromNumber(number) {
    let local = number.startsWith('92') ? number.slice(2) : number;
    if (local.startsWith('0')) local = local.slice(1);
    const prefix = local.slice(0, 3);
    const operators = {
        '300': 'Jazz', '301': 'Jazz', '302': 'Jazz', '316': 'Jazz', '317': 'Jazz', '318': 'Jazz',
        '303': 'Zong', '304': 'Zong', '305': 'Zong', '319': 'Zong', '320': 'Zong', '321': 'Zong',
        '306': 'Telenor', '307': 'Telenor', '308': 'Telenor', '322': 'Telenor', '323': 'Telenor', '324': 'Telenor',
        '310': 'Warid', '311': 'Warid', '312': 'Warid',
        '313': 'Ufone', '314': 'Ufone', '315': 'Ufone', '328': 'Ufone', '329': 'Ufone', '330': 'Ufone',
        '331': 'Ufone', '332': 'Ufone', '333': 'Ufone', '334': 'Ufone', '335': 'Ufone'
    };
    return operators[prefix] || 'Unknown';
}

async function numbertracker(sock, chatId, message, rawText) {
    const number = firstArg(rawText).replace(/[^0-9]/g, '');
    if (number.length < 10 || number.length > 15) return reply(sock, chatId, message, '❌ *Valid number do!*\nUsage: `.numbertracker 923001234567`');
    const country = getCountryFromNumber(number);
    await reply(sock, chatId, message,
        `*Mobile Number Tracker*\n\n` +
        `Number: ${number}\nCountry: ${country.country}\nCountry Code: ${country.code}\nOperator: ${getOperatorFromNumber(number)}\nTimezone: ${country.timezone}\nCurrency: ${country.currency}\n\n` +
        `Note: ye basic country/operator info hai. Personal location ya private details accessible nahi hoti.`
    );
}

async function iptracker(sock, chatId, message, rawText) {
    const ip = firstArg(rawText);
    if (!/^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(ip)) {
        return reply(sock, chatId, message, '❌ *Valid IP do!*\nUsage: `.iptracker 8.8.8.8`');
    }
    const res = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 10000 });
    const d = res.data;
    if (d.status === 'fail') return reply(sock, chatId, message, `IP lookup failed: ${d.message || 'unknown error'}`);
    await reply(sock, chatId, message,
        `*IP Address Tracker*\n\nIP: ${d.query}\nCountry: ${d.country || 'Unknown'}\nRegion: ${d.regionName || 'Unknown'}\nCity: ${d.city || 'Unknown'}\nTimezone: ${d.timezone || 'Unknown'}\nISP: ${d.isp || 'Unknown'}\nCoordinates: ${d.lat || '-'}, ${d.lon || '-'}`
    );
}

async function otpNotice(sock, chatId, message) {
    await reply(sock, chatId, message, '*OTP feature disabled*\n\nTemporary OTP/fake-number commands can be misused. Use only official verification methods for your own accounts.');
}

async function rate(sock, chatId, message, rawText) {
    const text = arg(rawText) || 'this';
    const rating = Math.floor(Math.random() * 10) + 1;
    await reply(sock, chatId, message, `*Rating: ${text}*\n\n${'⭐'.repeat(rating)}${'☆'.repeat(10 - rating)}\n\nScore: ${rating}/10`);
}

async function randomMember(sock, chatId, message, label) {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, message, 'This command can only be used in groups.');
    const meta = await sock.groupMetadata(chatId);
    const members = meta.participants.map(p => p.id);
    const winner = pick(members);
    await sock.sendMessage(chatId, {
        text: `*${label} found!*\n\n@${winner.split('@')[0]}`,
        mentions: [winner]
    }, { quoted: message });
}

async function wallpaper(sock, chatId, message, rawText) {
    const query = arg(rawText) || 'nature';
    await sock.sendMessage(chatId, {
        image: { url: `https://source.unsplash.com/1080x1920/?${encodeURIComponent(query)}` },
        caption: `*Wallpaper*\n\n${query}`
    }, { quoted: message });
}

async function unavailable(sock, chatId, message, command, note = 'Ye EDDY command add ho gayi hai, lekin is project me iska API/module configure nahi hai.') {
    await reply(sock, chatId, message, `*${command}*\n\n${note}`);
}

module.exports = {
    qr,
    shorturl,
    wiki,
    google,
    image,
    numbertracker,
    iptracker,
    otpNotice,
    rate,
    randomMember,
    wallpaper,
    unavailable
};
