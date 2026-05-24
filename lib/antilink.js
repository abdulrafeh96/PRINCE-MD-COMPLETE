const { isJidGroup } = require('@whiskeysockets/baileys');
const { getAntilink, incrementWarningCount, resetWarningCount, isSudo } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');
const config = require('../config');
const style = require('./eddyStyle');

const WARN_COUNT = config.WARN_COUNT || 3;
const LOCK_DURATION_MS = 2 * 60 * 1000;
const reopenTimers = new Map();
const ICON = {
    warn: '\u26A0\uFE0F',
    stop: '\u26D4',
    user: '\uD83D\uDC64',
    trash: '\uD83D\uDDD1\uFE0F',
    lock: '\uD83D\uDD12',
    unlock: '\uD83D\uDD13'
};

function containsURL(str) {
    const urlRegex = /(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?/i;
    return urlRegex.test(str);
}

function mention(sender) {
    return `@${sender.split('@')[0]}`;
}

async function sendAntiWarning(sock, jid, sender, reason, warningCount = null) {
    await sock.sendMessage(jid, {
        text:
`Anti-Link Alert

${mention(sender)}, links are not allowed in this group.
The group has been closed for 2 minutes and your message has been removed.

Warnings: ${warningCount || 1}/${WARN_COUNT}`,
        mentions: [sender]
    });
}

async function closeGroupTemporarily(sock, jid) {
    const oldTimer = reopenTimers.get(jid);
    if (oldTimer) clearTimeout(oldTimer);

    try {
        await sock.groupSettingUpdate(jid, 'announcement');
    } catch (error) {
        console.error('Error closing group after antilink:', error);
        return false;
    }

    const timer = setTimeout(async () => {
        reopenTimers.delete(jid);
        try {
            await sock.groupSettingUpdate(jid, 'not_announcement');
            await sock.sendMessage(jid, {
                text:
`${ICON.unlock} *${style.toSmallCaps('group opened')}*

${style.toSmallCaps('2 minutes antilink lock complete')}`
            }).catch(() => {});
        } catch (error) {
            console.error('Error reopening group after antilink lock:', error);
        }
    }, LOCK_DURATION_MS);

    reopenTimers.set(jid, timer);
    return true;
}

async function Antilink(msg, sock) {
    const jid = msg.key.remoteJid;
    if (!isJidGroup(jid)) return;

    const senderMessage =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        '';

    if (!senderMessage || typeof senderMessage !== 'string') return;

    const sender = msg.key.participant;
    if (!sender) return;

    try {
        const { isSenderAdmin } = await isAdmin(sock, jid, sender);
        if (isSenderAdmin) return;
    } catch (_) {}

    const senderIsSudo = await isSudo(sender);
    if (senderIsSudo) return;

    if (!containsURL(senderMessage.trim())) return;

    const antilinkConfig = await getAntilink(jid, 'on');
    if (!antilinkConfig?.enabled) return;

    const action = antilinkConfig.action || 'delete';

    try {
        await sock.sendMessage(jid, { delete: msg.key });
        await closeGroupTemporarily(sock, jid);
        const warningCount = await incrementWarningCount(jid, sender);
        await sendAntiWarning(sock, jid, sender, 'links are not allowed', warningCount);

        if (action === 'delete') {
            return;
        }

        if (action === 'kick') {
            await sock.groupParticipantsUpdate(jid, [sender], 'remove');
            await sock.sendMessage(jid, {
                text:
`${ICON.stop} *${style.toSmallCaps('antilink kick')}*

${ICON.user} ${mention(sender)}
${ICON.stop} ${style.toSmallCaps('removed from the group for sending a link')}
${ICON.lock} ${style.toSmallCaps('group has been closed for 2 minutes')}`,
                mentions: [sender]
            });
            return;
        }

        if (action === 'warn' || action === 'warndelete') {
            if (warningCount >= WARN_COUNT) {
                await sock.groupParticipantsUpdate(jid, [sender], 'remove');
                await resetWarningCount(jid, sender);
                await sock.sendMessage(jid, {
                    text:
`${ICON.stop} *${style.toSmallCaps('auto kick')}*

${ICON.user} ${mention(sender)}
${ICON.warn} ${style.toSmallCaps(`warning limit ${WARN_COUNT}/${WARN_COUNT} complete`)}
${ICON.stop} ${style.toSmallCaps('removed for sending links')}
${ICON.lock} ${style.toSmallCaps('group has been closed for 2 minutes')}`,
                    mentions: [sender]
                });
                return;
            }
        }
    } catch (error) {
        console.error('Error in Antilink:', error);
    }
}

module.exports = { Antilink };
