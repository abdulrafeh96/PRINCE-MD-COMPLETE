const axios = require('axios');
const { toSmallCaps } = require('../lib/eddyStyle');

module.exports = async function githubCommand(sock, chatId, message) {
    const body = message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        '';
    const username = body.split(' ').slice(1).join(' ').trim();

    if (!username) {
        await sock.sendMessage(chatId, {
            text: '❌ *GitHub username do!*\nUsage: `.github torvalds`'
        }, { quoted: message });
        return;
    }

    try {
        const { data } = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`, {
            timeout: 10000,
            headers: { 'User-Agent': 'AbdulBot' }
        });

        const text =
`🐙 *${toSmallCaps('github profile')}*

━━━━━━━━━━━━━━━━━━━━
👤 *${toSmallCaps('name')}:* ${data.name || data.login}
🔖 *${toSmallCaps('username')}:* ${data.login}
📝 *${toSmallCaps('bio')}:* ${data.bio || 'N/A'}
🏢 *${toSmallCaps('company')}:* ${data.company || 'N/A'}
📍 *${toSmallCaps('location')}:* ${data.location || 'N/A'}
📦 *${toSmallCaps('public repos')}:* ${data.public_repos}
👥 *${toSmallCaps('followers')}:* ${data.followers}
➡️ *${toSmallCaps('following')}:* ${data.following}
🔗 ${data.html_url}
━━━━━━━━━━━━━━━━━━━━`;

        await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch (err) {
        await sock.sendMessage(chatId, {
            text: '❌ *GitHub profile nahi mila!*\n_Username check karo aur dobara try karo._'
        }, { quoted: message });
    }
};
