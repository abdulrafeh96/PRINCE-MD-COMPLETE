const {
    setAntichannel,
    getAntichannel,
    removeAntichannel,
    incrementWarningCount,
    resetWarningCount
} = require('../lib/index');
const isAdmin = require('../lib/isAdmin');
const isOwnerOrSudo = require('../lib/isOwner');
const style = require('../lib/eddyStyle');
const config = require('../config');

const WARN_COUNT = config.WARN_COUNT || 3;
const LOCK_DURATION_MS = 2 * 60 * 1000;
const reopenTimers = new Map();
const ACTIONS = ['delete', 'kick', 'warn', 'warndelete'];
const ICON = {
    tv: '\uD83D\uDCFA',
    bolt: '\u26A1',
    chart: '\uD83D\uDCCA',
    gear: '\u2699\uFE0F',
    ok: '\u2705',
    fail: '\u274C',
    warn: '\u26A0\uFE0F',
    stop: '\u26D4',
    user: '\uD83D\uDC64',
    trash: '\uD83D\uDDD1\uFE0F'
};

function mention(senderId) {
    return `@${senderId.split('@')[0]}`;
}

function statusText(enabled) {
    return enabled ? `${ICON.ok} ${style.toSmallCaps('on')}` : `${ICON.fail} ${style.toSmallCaps('off')}`;
}

async function sendAntiChannelAlert(sock, chatId, senderId, warningCount = 1) {
    await sock.sendMessage(chatId, {
        text:
`Anti-Channel Alert

${mention(senderId)}, channel links/forwards are not allowed in this group.
The group has been closed for 2 minutes and your message has been removed.

Warnings: ${warningCount}/${WARN_COUNT}`,
        mentions: [senderId]
    });
}

async function closeGroupTemporarily(sock, chatId) {
    const oldTimer = reopenTimers.get(chatId);
    if (oldTimer) clearTimeout(oldTimer);

    try {
        await sock.groupSettingUpdate(chatId, 'announcement');
    } catch (error) {
        console.error('Error closing group after antichannel:', error);
        return false;
    }

    const timer = setTimeout(async () => {
        reopenTimers.delete(chatId);
        try {
            await sock.groupSettingUpdate(chatId, 'not_announcement');
            await sock.sendMessage(chatId, {
                text:
`${ICON.ok} *${style.toSmallCaps('group opened')}*

${style.toSmallCaps('2 minutes antichannel lock complete')}`
            }).catch(() => {});
        } catch (error) {
            console.error('Error reopening group after antichannel lock:', error);
        }
    }, LOCK_DURATION_MS);

    reopenTimers.set(chatId, timer);
    return true;
}

async function handleAntichannelCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: style.fail('for group admins only') }, { quoted: message });
            return;
        }

        const args = userMessage.slice(12).toLowerCase().trim().split(/\s+/).filter(Boolean);
        const action = args[0];

        if (!action) {
            const cfg = await getAntichannel(chatId);
            await sock.sendMessage(chatId, {
                text:
`${ICON.tv} *${style.toSmallCaps('antichannel status')}:* ${statusText(cfg?.enabled)}
${ICON.bolt} *${style.toSmallCaps('action')}:* ${style.toSmallCaps(cfg?.action || 'delete')}

${style.toSmallCaps('usage: .antichannel on/off/action')}
${style.toSmallCaps('actions: delete, kick, warn, warndelete')}`
            }, { quoted: message });
            return;
        }

        if (action === 'on') {
            await setAntichannel(chatId, 'on', 'delete');
            await sock.sendMessage(chatId, {
                text: `${ICON.tv} *${style.toSmallCaps('antichannel system')}* ${ICON.ok} ${style.toSmallCaps('enabled')}`
            }, { quoted: message });
            return;
        }

        if (action === 'off') {
            await removeAntichannel(chatId);
            await sock.sendMessage(chatId, {
                text: `${ICON.tv} *${style.toSmallCaps('antichannel system')}* ${ICON.fail} ${style.toSmallCaps('disabled')}`
            }, { quoted: message });
            return;
        }

        if (action === 'get') {
            const cfg = await getAntichannel(chatId);
            await sock.sendMessage(chatId, {
                text:
`${ICON.chart} *${style.toSmallCaps('antichannel configuration')}*

${ICON.ok} *${style.toSmallCaps('status')}:* ${cfg?.enabled ? 'ON' : 'OFF'}
${ICON.gear} *${style.toSmallCaps('action')}:* ${cfg?.action ? style.toSmallCaps(cfg.action) : style.toSmallCaps('not set')}`
            }, { quoted: message });
            return;
        }

        let setAction = action;
        if (action === 'action' || action === 'set') setAction = args[1];

        if (!ACTIONS.includes(setAction)) {
            await sock.sendMessage(chatId, {
                text: `${ICON.fail} *${style.toSmallCaps('invalid action')}*\n${style.toSmallCaps('usage: .antichannel action delete/kick/warn/warndelete')}`
            }, { quoted: message });
            return;
        }

        await setAntichannel(chatId, 'on', setAction);
        await sock.sendMessage(chatId, {
            text:
`${ICON.bolt} *${style.toSmallCaps('antichannel action set to')}:* ${style.toSmallCaps(setAction)}

${style.toSmallCaps('delete = remove message')}
${style.toSmallCaps('kick = remove user')}
${style.toSmallCaps('warn = add warning')}
${style.toSmallCaps('warndelete = warn user and delete message')}`
        }, { quoted: message });
    } catch (error) {
        console.error('Error in antichannel command:', error);
        await sock.sendMessage(chatId, { text: style.fail('error processing antichannel command') }, { quoted: message });
    }
}

function hasChannelContent(message) {
    const text = (
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        ''
    );

    return /(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/channel\/[A-Za-z0-9]+/i.test(text) ||
        /(?:https?:\/\/)?wa\.me\/channel\/[A-Za-z0-9]+/i.test(text);
}

async function deleteMessage(sock, chatId, message, senderId) {
    await sock.sendMessage(chatId, {
        delete: {
            remoteJid: chatId,
            fromMe: false,
            id: message.key.id,
            participant: senderId
        }
    }).catch(() => {});
}

async function handleChannelDetection(sock, chatId, message, senderId) {
    try {
        const cfg = await getAntichannel(chatId);
        if (!cfg?.enabled) return;
        if (message.key?.fromMe) return;
        if (await isOwnerOrSudo(senderId, sock, chatId)) return;

        const adminStatus = await isAdmin(sock, chatId, senderId);
        if (adminStatus.isSenderAdmin) return;
        if (!hasChannelContent(message)) return;

        await deleteMessage(sock, chatId, message, senderId);
        await closeGroupTemporarily(sock, chatId);
        const warningCount = await incrementWarningCount(chatId, senderId);
        await sendAntiChannelAlert(sock, chatId, senderId, warningCount);

        if (cfg.action === 'kick') {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove').catch(() => {});
            await sock.sendMessage(chatId, {
                text:
`${ICON.stop} *${style.toSmallCaps('antichannel kick')}*

${ICON.user} ${mention(senderId)}
${ICON.stop} ${style.toSmallCaps('channel content bhejne par remove kar diya gaya')}`,
                mentions: [senderId]
            }, { quoted: message });
            return;
        }

        if (cfg.action === 'warn' || cfg.action === 'warndelete') {
            if (warningCount >= WARN_COUNT) {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove').catch(() => {});
                await resetWarningCount(chatId, senderId);
                await sock.sendMessage(chatId, {
                    text:
`${ICON.stop} *${style.toSmallCaps('auto kick')}*

${ICON.user} ${mention(senderId)}
${ICON.warn} ${style.toSmallCaps(`warning limit ${WARN_COUNT}/${WARN_COUNT} complete`)}
${ICON.stop} ${style.toSmallCaps('channel content bhejne par remove kar diya gaya')}`,
                    mentions: [senderId]
                }, { quoted: message });
                return;
            }
            return;
        }
    } catch (error) {
        console.error('Error in channel detection:', error);
    }
}

module.exports = {
    handleAntichannelCommand,
    handleChannelDetection
};
