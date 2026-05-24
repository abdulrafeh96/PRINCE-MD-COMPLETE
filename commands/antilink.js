const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
const style = require('../lib/eddyStyle');

const WARN_COUNT = require('../config').WARN_COUNT || 3;
const ACTIONS = ['delete', 'kick', 'warn', 'warndelete'];
const ICON = {
    link: '\uD83D\uDD17',
    bolt: '\u26A1',
    chart: '\uD83D\uDCCA',
    gear: '\u2699\uFE0F',
    ok: '\u2705',
    fail: '\u274C',
    warn: '\u26A0\uFE0F',
    stop: '\u26D4',
    user: '\uD83D\uDC64'
};

function statusText(enabled) {
    return enabled ? `${ICON.ok} ${style.toSmallCaps('on')}` : `${ICON.fail} ${style.toSmallCaps('off')}`;
}

function mention(senderId) {
    return `@${senderId.split('@')[0]}`;
}

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: style.fail('for group admins only') }, { quoted: message });
            return;
        }

        const args = userMessage.slice(9).toLowerCase().trim().split(/\s+/).filter(Boolean);
        const action = args[0];

        if (!action) {
            const current = await getAntilink(chatId, 'on');
            await sock.sendMessage(chatId, {
                text:
`${ICON.link} *${style.toSmallCaps('antilink status')}:* ${statusText(current?.enabled)}
${ICON.bolt} *${style.toSmallCaps('action')}:* ${style.toSmallCaps(current?.action || 'delete')}

${style.toSmallCaps('usage: .antilink on/off/action')}
${style.toSmallCaps('actions: delete, kick, warn, warndelete')}`
            }, { quoted: message });
            return;
        }

        if (action === 'on') {
            const existingConfig = await getAntilink(chatId, 'on');
            if (existingConfig?.enabled) {
                await sock.sendMessage(chatId, { text: style.warn('antilink is already on') }, { quoted: message });
                return;
            }

            const result = await setAntilink(chatId, 'on', 'delete');
            await sock.sendMessage(chatId, {
                text: result
                    ? `${ICON.link} *${style.toSmallCaps('antilink system')}* ${ICON.ok} ${style.toSmallCaps('enabled')}`
                    : `${ICON.fail} *${style.toSmallCaps('failed to turn on antilink')}*`
            }, { quoted: message });
            return;
        }

        if (action === 'off') {
            await removeAntilink(chatId, 'on');
            await sock.sendMessage(chatId, {
                text: `${ICON.link} *${style.toSmallCaps('antilink system')}* ${ICON.fail} ${style.toSmallCaps('disabled')}`
            }, { quoted: message });
            return;
        }

        if (action === 'get') {
            const cfg = await getAntilink(chatId, 'on');
            await sock.sendMessage(chatId, {
                text:
`${ICON.chart} *${style.toSmallCaps('antilink configuration')}*

${ICON.ok} *${style.toSmallCaps('status')}:* ${cfg?.enabled ? 'ON' : 'OFF'}
${ICON.gear} *${style.toSmallCaps('action')}:* ${cfg?.action ? style.toSmallCaps(cfg.action) : style.toSmallCaps('not set')}`
            }, { quoted: message });
            return;
        }

        let setAction = action;
        if (action === 'action' || action === 'set') setAction = args[1];

        if (!ACTIONS.includes(setAction)) {
            await sock.sendMessage(chatId, {
                text: `${ICON.fail} *${style.toSmallCaps('invalid action')}*\n${style.toSmallCaps('usage: .antilink action delete/kick/warn/warndelete')}`
            }, { quoted: message });
            return;
        }

        const setResult = await setAntilink(chatId, 'on', setAction);
        await sock.sendMessage(chatId, {
            text: setResult
                ? `${ICON.bolt} *${style.toSmallCaps('antilink action set to')}:* ${style.toSmallCaps(setAction)}\n\n` +
                    `${style.toSmallCaps('delete = remove message')}\n` +
                    `${style.toSmallCaps('kick = remove user')}\n` +
                    `${style.toSmallCaps('warn = add warning')}\n` +
                    `${style.toSmallCaps('warndelete = warn user and delete message')}`
                : `${ICON.fail} *${style.toSmallCaps('failed to set antilink action')}*`
        }, { quoted: message });
    } catch (error) {
        console.error('Error in antilink command:', error);
        await sock.sendMessage(chatId, { text: style.fail('error processing antilink command') }, { quoted: message });
    }
}

async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const cfg = await getAntilink(chatId, 'on');
        if (!cfg?.enabled || message.key?.fromMe) return;

        const linkPatterns = [
            /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
            /wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
            /t\.me\/[A-Za-z0-9_]+/i,
            /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i
        ];

        if (!linkPatterns.some((pattern) => pattern.test(userMessage || ''))) return;

        await sock.sendMessage(chatId, {
            delete: {
                remoteJid: chatId,
                fromMe: false,
                id: message.key.id,
                participant: message.key.participant || senderId
            }
        }).catch(() => {});

        await sock.sendMessage(chatId, {
            text:
`${ICON.warn} *${style.toSmallCaps('antilink warning')}*

${ICON.user} ${mention(senderId)}
${ICON.stop} ${style.toSmallCaps('links are not allowed')}
${ICON.warn} *${style.toSmallCaps('action')}:* ${style.toSmallCaps(cfg.action || 'delete')}`,
            mentions: [senderId]
        }, { quoted: message });
    } catch (error) {
        console.error('Error in link detection:', error);
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection,
};
