const axios = require('axios');

module.exports = {
    lyricsCommand: async function (sock, chatId, songTitle, message) {
        const query = (songTitle || '').trim();

        if (!query) {
            await sock.sendMessage(chatId, {
                text: '❌ *Provide a song name!*\nUsage: `.lyrics Shape of You`'
            }, { quoted: message });
            return;
        }

        try {
            let artist = '';
            let title = query;
            if (query.includes(' - ')) {
                [artist, title] = query.split(' - ').map(s => s.trim());
            } else if (query.includes(' by ')) {
                [title, artist] = query.split(' by ').map(s => s.trim());
            }

            const url = artist
                ? `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
                : `https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`;
            const res = await axios.get(url, { timeout: 10000 });

            if (artist && res.data?.lyrics) {
                await sock.sendMessage(chatId, {
                    text: `🎵 *Lyrics: ${title}*\n${artist ? `👤 *Artist:* ${artist}\n` : ''}\n━━━━━━━━━━━━━━━━━━\n${res.data.lyrics.slice(0, 1500)}`
                }, { quoted: message });
                return;
            }

            const song = res.data?.data?.[0];
            if (!song) throw new Error('Song not found');

            const lyricsRes = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist.name)}/${encodeURIComponent(song.title)}`, {
                timeout: 10000
            });

            await sock.sendMessage(chatId, {
                text: `🎵 *${song.title}*\n👤 *Artist:* ${song.artist.name}\n\n━━━━━━━━━━━━━━━━━━\n${(lyricsRes.data?.lyrics || '').slice(0, 1500)}`
            }, { quoted: message });
        } catch (err) {
            await sock.sendMessage(chatId, {
                text: '❌ *Lyrics not found!*\n_Try format: `.lyrics Artist - Song Title`_'
            }, { quoted: message });
        }
    }
};
