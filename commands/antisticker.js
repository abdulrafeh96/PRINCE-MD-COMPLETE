const {
    setAntisticker,
    getAntisticker,
    removeAntisticker,
    incrementWarningCount,
    resetWarningCount
} = require('../lib/index');
const isAdmin = require('../lib/isAdmin');
const isOwnerOrSudo = require('../lib/isOwner');
const style = require('../lib/eddyStyle');
const config = require('../config');

const WARN_COUNT = config.WARN_COUNT || 3;
const ACTIONS = ['delete', 'kick', 'warn', 'warndelete'];
const ICON = {
    sticker: '\uD83C\uDFAD',
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

function compactLines(lines) {
    return lines.filter(Boolean).join('\n');
}

async function handleAntistickerCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: style.fail('for group admins only') }, { quoted: message });
            return;
        }

        const args = userMessage.slice(12).toLowerCase().trim().split(/\s+/).filter(Boolean);
        const action = args[0];

        if (!action) {
            const cfg = await getAntisticker(chatId);
            await sock.sendMessage(chatId, {
                text: compactLines([
                    `${ICON.sticker} *${style.toSmallCaps('antisticker status')}:* ${statusText(cfg?.enabled)}`,
                    `${ICON.bolt} *${style.toSmallCaps('action')}:* ${style.toSmallCaps(cfg?.action || 'delete')}`,
                    '',
                    `${style.toSmallCaps('usage: .antisticker on/off/action')}`,
                    `${style.toSmallCaps('actions: delete, kick, warn, warndelete')}`
                ])
            }, { quoted: message });
            return;
        }

        if (action === 'on') {
            await setAntisticker(chatId, 'on', 'delete');
            await sock.sendMessage(chatId, {
                text: `${ICON.sticker} *${style.toSmallCaps('antisticker system')}* ${ICON.ok} ${style.toSmallCaps('enabled')}`
            }, { quoted: message });
            return;
        }

        if (action === 'off') {
            await removeAntisticker(chatId);
            await sock.sendMessage(chatId, {
                text: `${ICON.sticker} *${style.toSmallCaps('antisticker system')}* ${ICON.fail} ${style.toSmallCaps('disabled')}`
            }, { quoted: message });
            return;
        }

        if (action === 'get') {
            const cfg = await getAntisticker(chatId);
            await sock.sendMessage(chatId, {
                text: compactLines([
                    `${ICON.chart} *${style.toSmallCaps('antisticker configuration')}*`,
                    `${ICON.ok} *${style.toSmallCaps('status')}:* ${cfg?.enabled ? 'ON' : 'OFF'}`,
                    `${ICON.gear} *${style.toSmallCaps('action')}:* ${cfg?.action ? style.toSmallCaps(cfg.action) : style.toSmallCaps('not set')}`
                ])
            }, { quoted: message });
            return;
        }

        let setAction = action;
        if (action === 'action' || action === 'set') setAction = args[1];

        if (!ACTIONS.includes(setAction)) {
            await sock.sendMessage(chatId, {
                text: `${ICON.fail} *${style.toSmallCaps('invalid action')}*\n${style.toSmallCaps('usage: .antisticker action delete/kick/warn/warndelete')}`
            }, { quoted: message });
            return;
        }

        await setAntisticker(chatId, 'on', setAction);
        await sock.sendMessage(chatId, {
            text: compactLines([
                `${ICON.bolt} *${style.toSmallCaps('antisticker action set to')}:* ${style.toSmallCaps(setAction)}`,
                '',
                `${style.toSmallCaps('delete = remove message')}`,
                `${style.toSmallCaps('kick = remove user')}`,
                `${style.toSmallCaps('warn = add warning')}`,
                `${style.toSmallCaps('warndelete = warn user and delete message')}`
            ])
        }, { quoted: message });
    } catch (error) {
        console.error('Error in antisticker command:', error);
        await sock.sendMessage(chatId, { text: style.fail('error processing antisticker command') }, { quoted: message });
    }
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

async function handleStickerDetection(sock, chatId, message, senderId) {
    try {
        const cfg = await getAntisticker(chatId);
        if (!cfg?.enabled) return;
        if (message.key?.fromMe) return;
        if (!message.message?.stickerMessage) return;

        const ownerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);
        const adminStatus = await isAdmin(sock, chatId, senderId);
        if (ownerOrSudo || adminStatus.isSenderAdmin) {
            await deleteMessage(sock, chatId, message, senderId);
            return;
        }

        await deleteMessage(sock, chatId, message, senderId);

        if (cfg.action === 'kick') {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove').catch(() => {});
            await sock.sendMessage(chatId, {
                text: compactLines([
                    `${ICON.stop} *${style.toSmallCaps('antisticker kick')}*`,
                    '',
                    `${ICON.user} ${mention(senderId)}`,
                    `${ICON.stop} ${style.toSmallCaps('sticker bhejne par remove kar diya gaya')}`
                ]),
                mentions: [senderId]
            }, { quoted: message });
            return;
        }

        if (cfg.action === 'warn' || cfg.action === 'warndelete') {
            const warningCount = await incrementWarningCount(chatId, senderId);
            if (warningCount >= WARN_COUNT) {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove').catch(() => {});
                await resetWarningCount(chatId, senderId);
                await sock.sendMessage(chatId, {
                    text: compactLines([
                        `${ICON.stop} *${style.toSmallCaps('auto kick')}*`,
                        '',
                        `${ICON.user} ${mention(senderId)}`,
                        `${ICON.warn} ${style.toSmallCaps(`warning limit ${WARN_COUNT}/${WARN_COUNT} complete`)}`,
                        `${ICON.stop} ${style.toSmallCaps('sticker bhejne par remove kar diya gaya')}`
                    ]),
                    mentions: [senderId]
                }, { quoted: message });
                return;
            }

            await sock.sendMessage(chatId, {
                text: compactLines([
                    `${ICON.warn} *${style.toSmallCaps('antisticker warning')}*`,
                    '',
                    `${ICON.user} ${mention(senderId)}`,
                    `${ICON.stop} ${style.toSmallCaps('stickers allowed nahi hain')}`,
                    `${ICON.warn} *${style.toSmallCaps('warnings')}:* ${warningCount}/${WARN_COUNT}`
                ]),
                mentions: [senderId]
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, {
            text: compactLines([
                `${ICON.trash} *${style.toSmallCaps('antisticker')}*`,
                '',
                `${ICON.user} ${mention(senderId)}`,
                `${ICON.stop} ${style.toSmallCaps('sticker delete kar diya gaya')}`
            ]),
            mentions: [senderId]
        }, { quoted: message });
    } catch (error) {
        console.error('Error in sticker detection:', error);
    }
}

module.exports = {
    handleAntistickerCommand,
    handleStickerDetection
};
