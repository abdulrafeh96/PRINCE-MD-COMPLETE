const { addWelcome, delWelcome, isWelcomeOn } = require('../lib/index');
const { box } = require('../commands/princeStyle');

async function handleWelcome(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: box('📥 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐒𝐄𝐓𝐔𝐏', [
                '*.welcome on*  — ᴇɴᴀʙʟᴇ ᴡᴇʟᴄᴏᴍᴇ',
                '*.welcome set <text>*  — ᴄᴜꜱᴛᴏᴍ ᴍᴇꜱꜱᴀɢᴇ',
                '*.welcome off*  — ᴅɪꜱᴀʙʟᴇ ᴡᴇʟᴄᴏᴍᴇ',
                'ᴠᴀʀɪᴀʙʟᴇꜱ : {user} {group} {description}'
            ])
        }, { quoted: message });
    }

    const [command, ...args] = match.split(' ');
    const lowerCommand = command.toLowerCase();
    const customMessage = args.join(' ');

    if (lowerCommand === 'on') {
        if (await isWelcomeOn(chatId)) {
            return sock.sendMessage(chatId, {
                text: box('⚠️ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄', ['ᴡᴇʟᴄᴏᴍᴇ ᴍᴇꜱꜱᴀɢᴇꜱ ᴀʟʀᴇᴀᴅʏ ᴇɴᴀʙʟᴇᴅ'])
            }, { quoted: message });
        }
        await addWelcome(chatId, true, '');
        return sock.sendMessage(chatId, {
            text: box('✅ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄', ['ᴡᴇʟᴄᴏᴍᴇ ᴍᴇꜱꜱᴀɢᴇꜱ ᴇɴᴀʙʟᴇᴅ', 'ᴜꜱᴇ *.welcome set <text>* ᴛᴏ ᴄᴜꜱᴛᴏᴍɪᴢᴇ'])
        }, { quoted: message });
    }

    if (lowerCommand === 'off') {
        if (!(await isWelcomeOn(chatId))) {
            return sock.sendMessage(chatId, {
                text: box('⚠️ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄', ['ᴡᴇʟᴄᴏᴍᴇ ᴍᴇꜱꜱᴀɢᴇꜱ ᴀʟʀᴇᴀᴅʏ ᴅɪꜱᴀʙʟᴇᴅ'])
            }, { quoted: message });
        }
        await delWelcome(chatId);
        return sock.sendMessage(chatId, {
            text: box('✅ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄', ['ᴡᴇʟᴄᴏᴍᴇ ᴍᴇꜱꜱᴀɢᴇꜱ ᴅɪꜱᴀʙʟᴇᴅ'])
        }, { quoted: message });
    }

    if (lowerCommand === 'set') {
        if (!customMessage) {
            return sock.sendMessage(chatId, {
                text: box('⚠️ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄', ['ᴘʟᴇᴀꜱᴇ ᴘʀᴏᴠɪᴅᴇ ᴄᴜꜱᴛᴏᴍ ᴍᴇꜱꜱᴀɢᴇ', 'ᴇxᴀᴍᴘʟᴇ : *.welcome set Welcome {user}*'])
            }, { quoted: message });
        }
        await addWelcome(chatId, true, customMessage);
        return sock.sendMessage(chatId, {
            text: box('✅ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄', ['ᴄᴜꜱᴛᴏᴍ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇꜱꜱᴀɢᴇ ꜱᴇᴛ'])
        }, { quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: box('❌ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄', ['ᴜꜱᴇ : *.welcome on*', 'ᴜꜱᴇ : *.welcome set <message>*', 'ᴜꜱᴇ : *.welcome off*'])
    }, { quoted: message });
}

module.exports = { handleWelcome };
