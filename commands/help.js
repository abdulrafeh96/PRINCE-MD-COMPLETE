const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const { toSmallCaps } = require('../lib/eddyStyle');

function getKarachiDateParts() {
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

function sc(text) {
    return toSmallCaps(text);
}

async function helpCommand(sock, chatId, message) {
    const botName = settings.botName || 'Prince Md';
    const userName = message.pushName || message.verifiedBizName || 'User';
    const mode = settings.commandMode || 'public';
    const { time, date } = getKarachiDateParts();

    const menu = `╭━━〔𓆩 ${sc(botName)} 𓆪〕━━⬣
┃✮╭────────────────
┃✮│ ${sc('bot name')} : *${sc(botName)}*
┃✮│ ${sc('user')} : *${sc(userName)}*
┃✮│ ${sc('dev')} : *${sc(settings.botOwner || 'Abdul Rafeh')}*
┃✮│ ${sc('mode')} : *${sc(mode)}*
┃✮│ ${sc('prefix')} : *[ . ]*
┃✮│ ${sc('time')} : *${sc(time)}*
┃✮│ ${sc('date')} : *${sc(date)}*
┃✮╰────────────────
╰━━━━━━━━━━━━━━⬣
          ${sc('hey')} *${sc(userName)}*
  𓆩 ${sc(botName)} 𓆪 ${sc('at your service')}

*┏━━〔 💠 𝐌𝐀𝐈𝐍 〕*
┃ ❍ .ᴍᴇɴᴜ
┃ ❍ .ᴘɪɴɢ
┃ ❍ .ᴀʟɪᴠᴇ
┃ ❍ .ɪɴꜰᴏ
┃ ❍ .ᴜᴘᴛɪᴍᴇ
┃ ❍ .ꜱᴘᴇᴇᴅ
┃ ❍ .ᴏᴡɴᴇʀ
┃ ❍ .ᴘᴀɪʀ
┗━━━━━━━━━━━━┛

*┏━━〔 👥 𝐆𝐑𝐎𝐔𝐏 〕*
┃ ❍ .ᴋɪᴄᴋ
┃ ❍ .ᴀᴅᴅ
┃ ❍ .ᴘʀᴏᴍᴏᴛᴇ
┃ ❍ .ᴅᴇᴍᴏᴛᴇ
┃ ❍ .ᴍᴜᴛᴇ
┃ ❍ .ᴜɴᴍᴜᴛᴇ
┃ ❍ .ᴛᴀɢᴀʟʟ
┃ ❍ .ʜɪᴅᴇᴛᴀɢ
┃ ❍ .ɢʀᴏᴜᴘɪɴꜰᴏ
┃ ❍ .ꜱᴇᴛɴᴀᴍᴇ
┃ ❍ .ꜱᴇᴛᴅᴇꜱᴄ
┃ ❍ .ꜱᴇᴛᴘᴘɢᴄ
┃ ❍ .ʟɪɴᴋɢᴄ
┃ ❍ .ʀᴇᴠᴏᴋᴇɢᴄ
┃ ❍ .ᴀɴᴛɪʟɪɴᴋ
┃ ❍ .ᴀɴᴛɪꜱᴛɪᴄᴋᴇʀ
┃ ❍ .ᴀɴᴛɪɢʀᴏᴜᴘ
┃ ❍ .ᴀᴜᴛᴏᴏᴘᴇɴ 09:00
┃ ❍ .ᴀᴜᴛᴏᴄʟᴏꜱᴇ 22:00
┃ ❍ .ᴀᴜᴛᴏꜱᴛᴀᴛᴜꜱ
┃ ❍ .ꜱᴄʜᴇᴅᴜʟᴇ ꜱᴛᴀᴛᴜꜱ
┃ ❍ .ɢʀᴏᴜᴘꜱᴛᴀᴛᴜꜱ
┃ ❍ .ᴡᴀʀɴ
┃ ❍ .ʀᴇꜱᴇᴛᴡᴀʀɴ
┃ ❍ .ᴡᴇʟᴄᴏᴍᴇ
┃ ❍ .ʟᴏᴄᴋᴄʜᴀᴛ
┃ ❍ .ᴜɴʟᴏᴄᴋᴄʜᴀᴛ
┃ ❍ .ʟᴏᴄᴋᴇᴅᴜꜱᴇʀꜱ
┗━━━━━━━━━━━━┛

*┏━━〔 🤖 𝐀𝐈 𝐓𝐎𝐎𝐋𝐒 〕*
┃ ❍ .ᴡᴏʀᴍɢᴘᴛ / .ᴡɢᴘᴛ
┃ ❍ .ᴄᴜʀꜱᴏʀᴀɪ / .ᴄᴜʀꜱᴏʀ
┃ ❍ .ᴄʟᴀᴜᴅᴇ
┃ ❍ .ɢʀᴏᴋ
┃ ❍ .ᴅᴇᴠɪɴ
┃ ❍ .ᴡɪɴᴅꜱᴜʀꜰ
┃ ❍ .ᴄᴏᴅᴇx
┃ ❍ .ɢᴘᴛ5.4
┃ ❍ .ʙᴏʟᴛ
┃ ❍ .ᴋɪʀᴏ
┃ ❍ .ʙʙᴄ
┃ ❍ .ᴄʜᴀᴛʙᴏᴛᴅᴍ
┃ ❍ .ᴄʜᴀᴛʙᴏᴛɢᴄ
┃ ❍ .ᴄʜᴀᴛɢᴘᴛ / .ɢᴘᴛ
┃ ❍ .ᴀɪɪᴍᴀɢᴇ / .ᴀɪɪᴍɢ / .ᴅᴀʟʟᴇ
┗━━━━━━━━━━━━┛

*┏━━〔 📥 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 〕*
┃ ❍ .ᴘʟᴀʏ
┃ ❍ .ᴠɪᴅᴇᴏ
┃ ❍ .ꜱᴏɴɢ
┃ ❍ .ɢɪꜰ
┃ ❍ .ᴛᴏᴍᴘ3
┃ ❍ .ʏᴛᴍᴘ3
┃ ❍ .ʏᴛᴍᴘ4
┃ ❍ .ᴛɪᴋᴛᴏᴋ
┃ ❍ .ɪɴꜱᴛᴀɢʀᴀᴍ
┃ ❍ .ꜰᴀᴄᴇʙᴏᴏᴋ
┃ ❍ .ᴘɪɴᴛᴇʀᴇꜱᴛ
┃ ❍ .ᴘɪɴ
┃ ❍ .ᴘɪɴᴅʟ
┃ ❍ .ᴘɪɴᴛᴇʀᴇꜱᴛᴅʟ
┗━━━━━━━━━━━━┛

*┏━━〔 🎓 𝐄𝐃𝐔𝐂𝐀𝐓𝐈𝐎𝐍𝐀𝐋 〕*
┃ ❍ ᴄs101 ᴍɪᴅ ꜰɪʟᴇꜱ
┃ ❍ ᴄs101 ꜰɪɴᴀʟ ꜰɪʟᴇꜱ
┃ ❍ ᴄs101 ʜᴀɴᴅᴏᴜᴛꜱ
┃ ❍ ᴄs101 ʜɪɢʜʟɪɢʜᴛᴇᴅ ʜᴀɴᴅᴏᴜᴛꜱ
┃ ❍ !ᴍᴏʀᴇ ꜰɪʟᴇꜱ ᴍɪᴅ ᴄs101
┃ ❍ !ᴍᴏʀᴇ ꜰɪʟᴇꜱ ꜰɪɴᴀʟ ᴄs101
┗━━━━━━━━━━━━┛

*┏━━〔 ⚙️ 𝐔𝐓𝐈𝐋𝐈𝐓𝐘 〕*
┃ ❍ .ᴡᴇᴀᴛʜᴇʀ
┃ ❍ .ᴛʀᴀɴꜱʟᴀᴛᴇ
┃ ❍ .ᴄᴀʟᴄ
┃ ❍ .ǫʀ
┃ ❍ .ɢᴏᴏɢʟᴇ
┃ ❍ .ᴡᴇʙ
┃ ❍ .ᴊɪᴅ
┃ ❍ .ᴛᴛꜱ
┃ ❍ .ꜱʜᴏʀᴛᴜʀʟ
┃ ❍ .ʀᴇᴠᴇʀꜱᴇ
┃ ❍ .ꜰᴀɴᴄʏ
┃ ❍ .ᴠɪᴇᴡᴏɴᴄᴇ
┃ ❍ .ʀᴇᴀᴄᴛ
┃ ❍ .ᴛᴏᴛᴀʟᴄʜᴀᴛ
┃ ❍ .ᴡᴀꜱᴛᴀʟᴋ
┃ ❍ .ɢᴇᴛᴘᴘ
┃ ❍ .ᴡᴀꜱᴛᴀᴛᴜꜱ
┗━━━━━━━━━━━━┛

*┏━━〔 🔒 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 & 𝐏𝐑𝐈𝐕𝐀𝐂𝐘 〕*
┃ ❍ .ɴᴜᴍʙᴇʀᴛʀᴀᴄᴋᴇʀ
┃ ❍ .ɴᴜᴍᴛʀᴀᴄᴋ
┃ ❍ .ɪᴘᴛʀᴀᴄᴋᴇʀ
┃ ❍ .ɪᴘᴛʀᴀᴄᴋ
┃ ❍ .ꜰᴀᴋᴇɴᴜᴍʙᴇʀ
┃ ❍ .ꜰᴀᴋᴇɴᴜᴍ
┃ ❍ .ᴄʜᴇᴄᴋɴᴜᴍʙᴇʀ
┃ ❍ .ᴄʜᴇᴄᴋɴᴜᴍ
┃ ❍ .ᴏᴛᴘ
┃ ❍ .ᴏᴛᴘꜱᴛᴀᴛᴜꜱ
┗━━━━━━━━━━━━┛

*┏━━〔 🎮 𝐅𝐔𝐍 & 𝐆𝐀𝐌𝐄𝐒 〕*
┃ ❍ .ᴊᴏᴋᴇ
┃ ❍ .ǫᴜᴏᴛᴇ
┃ ❍ .ꜰᴀᴄᴛ
┃ ❍ .8ʙᴀʟʟ
┃ ❍ .ᴅᴀʀᴇ
┃ ❍ .ᴛʀᴜᴛʜ
┃ ❍ .ꜱʜɪᴘ
┃ ❍ .ʀᴀᴛᴇ
┃ ❍ .ᴛɪᴄ
┃ ❍ .ᴅᴀᴜɢʜᴛᴇʀ / .ʙᴇᴛɪ
┃ ❍ .ᴡɪꜰᴇ
┃ ❍ .ꜱᴏɴ / .ʙᴇᴛᴀ
┃ ❍ .ʜᴀɴɢᴍᴀɴ
┗━━━━━━━━━━━━┛

*┏━━〔 🧩 𝐄𝐗𝐓𝐑𝐀 〕*
┃ ❍ .ᴛᴏɪᴍɢ
┃ ❍ .ꜱᴛɪᴄᴋᴇʀɪɴꜰᴏ
┃ ❍ .ᴛᴡɪᴛᴛᴇʀ / .ᴛᴡ
┃ ❍ .ᴛᴇʀᴀʙᴏx / .ᴛʙ
┃ ❍ .ꜱꜱᴛᴀᴛᴜꜱ
┃ ❍ .ᴡɪᴋɪ
┃ ❍ .ꜱᴇᴀʀᴄʜ
┃ ❍ .ɪᴍᴀɢᴇ / .ɪᴍɢ
┃ ❍ .ᴡᴀʟʟᴘᴀᴘᴇʀ / .ᴡᴘ
┃ ❍ .ʜᴅ
┃ ❍ .ʀᴀɴᴋ
┃ ❍ .ꜱᴇᴛᴄᴍᴅ
┃ ❍ .ɢᴇᴛᴄᴍᴅ
┃ ❍ .ᴅᴇʟᴄᴍᴅ
┗━━━━━━━━━━━━┛

*┏━━〔 ⚙️ 𝐎𝐖𝐍𝐄𝐑 〕*
┃ ❍ .ᴍᴏᴅᴇ
┃ ❍ .ᴀᴅᴅᴏᴡɴᴇʀ
┃ ❍ .ʀᴇᴍᴏᴠᴇᴏᴡɴᴇʀ
┃ ❍ .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ
┃ ❍ .ʙʀᴏᴀᴅᴄᴀꜱᴛ
┃ ❍ .ʀᴇꜱᴛᴀʀᴛ
┃ ❍ .ᴅᴇʟᴇᴛᴇ
┃ ❍ .ɢᴇᴛᴘᴘ
┃ ❍ .ᴀꜰᴋ
┃ ❍ .ᴘɴᴏᴛɪꜰʏ
┃ ❍ .ᴅɴᴏᴛɪꜰʏ
┃ ❍ .ʀᴇꜱᴛʀɪᴄᴛ
┃ ❍ .ᴜɴʀᴇꜱᴛʀɪᴄᴛ
┃ ❍ .ꜱɪᴍɪɴꜰᴏ
┃ ❍ .ᴄɴɪᴄɪɴꜰᴏ
┗━━━━━━━━━━━━┛

> ${sc('powered by')} ${sc(botName)}`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chatId, {
                image: fs.readFileSync(imagePath),
                caption: `𓆩 ${sc(botName)} 𓆪`
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Help image error:', error);
    }

    await sock.sendMessage(chatId, { text: menu }, { quoted: message });
}

module.exports = helpCommand;
