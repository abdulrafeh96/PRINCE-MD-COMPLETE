const settings = require('../settings');

function smallCaps(text) {
    const map = {
        a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
        n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
    };
    return String(text || '').split('').map(ch => map[ch.toLowerCase()] || ch).join('');
}

function nowParts() {
    const now = new Date();
    return {
        time: now.toLocaleTimeString('en-PK', {
            timeZone: 'Asia/Karachi',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }).toLowerCase(),
        date: now.toLocaleDateString('en-GB', {
            timeZone: 'Asia/Karachi',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    };
}

function box(title, lines, footer = `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${settings.botName || 'Prince Md'}`) {
    const body = lines.map(line => `┃✮│ ${line}`).join('\n');
    return `╭━━〔𓆩 ${settings.botName || 'Prince Md'} 𓆪〕━━┈⊷
┃✮╭──〔 ${title} 〕
${body}
┃✮╰────────────────
╰━━━━━━━━━━━━━━━┈⊷
> ${footer}`;
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (secs || parts.length === 0) parts.push(`${secs}s`);
    return parts.join(' ');
}

module.exports = { box, formatUptime, nowParts, smallCaps };
