const axios = require('axios');
const { toSmallCaps } = require('../lib/eddyStyle');

async function weatherCommand(sock, chatId, message, city) {
    const query = (city || '').trim();

    if (!query) {
        await sock.sendMessage(chatId, {
            text: '❌ *City name do!*\nUsage: `.weather Karachi`'
        }, { quoted: message });
        return;
    }

    try {
        const res = await axios.get(`https://wttr.in/${encodeURIComponent(query)}?format=j1`, {
            timeout: 10000
        });
        const data = res.data;
        const cur = data.current_condition?.[0];
        const area = data.nearest_area?.[0];

        if (!cur) throw new Error('No weather data found');

        const areaName = area?.areaName?.[0]?.value || query;
        const country = area?.country?.[0]?.value || '';
        const desc = cur.weatherDesc?.[0]?.value || '';

        const text =
`🌤️ *${toSmallCaps('weather report')}*

━━━━━━━━━━━━━━━━━━━━
📍 *${toSmallCaps('location')}:* ${areaName}${country ? ', ' + country : ''}
🌡️ *${toSmallCaps('temperature')}:* ${cur.temp_C}°C
🤔 *${toSmallCaps('feels like')}:* ${cur.FeelsLikeC}°C
☁️ *${toSmallCaps('condition')}:* ${desc}
💧 *${toSmallCaps('humidity')}:* ${cur.humidity}%
💨 *${toSmallCaps('wind speed')}:* ${cur.windspeedKmph} km/h
👁️ *${toSmallCaps('visibility')}:* ${cur.visibility} km
━━━━━━━━━━━━━━━━━━━━`;

        await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch (err) {
        await sock.sendMessage(chatId, {
            text: '❌ *Weather fetch failed!*\n_City name check karo aur dobara try karo._'
        }, { quoted: message });
    }
}

module.exports = weatherCommand;
