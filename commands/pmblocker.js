const fs = require('fs');
const isOwnerOrSudo = require('../lib/isOwner');
const style = require('../lib/eddyStyle');

const PMBLOCKER_PATH = './data/pmblocker.json';

function readState() {
    try {
        if (!fs.existsSync(PMBLOCKER_PATH)) return { enabled: false, message: '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.' };
        const raw = fs.readFileSync(PMBLOCKER_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');
        return {
            enabled: !!data.enabled,
            message: typeof data.message === 'string' && data.message.trim() ? data.message : '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.'
        };
    } catch {
        return { enabled: false, message: '⚠️ Direct messages are blocked!\nYou cannot DM this bot. Please contact the owner in group chats only.' };
    }
}

function writeState(enabled, message) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        const current = readState();
        const payload = {
            enabled: !!enabled,
            message: typeof message === 'string' && message.trim() ? message : current.message
        };
        fs.writeFileSync(PMBLOCKER_PATH, JSON.stringify(payload, null, 2));
    } catch {}
}

async function pmblockerCommand(sock, chatId, message, args) {
    const senderId = message.key.participant || message.key.remoteJid;
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
    
    if (!message.key.fromMe && !isOwner) {
        await sock.sendMessage(chatId, { text: style.fail('only bot owner can use this command') }, { quoted: message });
        return;
    }
    
    const argStr = (args || '').trim();
    const [sub, ...rest] = argStr.split(' ');
    const state = readState();

    if (!sub || !['on', 'off', 'status', 'setmsg'].includes(sub.toLowerCase())) {
        await sock.sendMessage(chatId, {
            text: style.usage('pmblocker owner only', [
                `.pmblocker on - ${style.toSmallCaps('enable pm auto-block')}`,
                `.pmblocker off - ${style.toSmallCaps('disable pm blocker')}`,
                `.pmblocker status - ${style.toSmallCaps('show current status')}`,
                `.pmblocker setmsg <text> - ${style.toSmallCaps('set warning message')}`
            ])
        }, { quoted: message });
        return;
    }

    if (sub.toLowerCase() === 'status') {
        await sock.sendMessage(chatId, { text: `📊 *${style.toSmallCaps('pm blocker status')}*: *${state.enabled ? 'ON' : 'OFF'}*\n💬 *${style.toSmallCaps('message')}*: ${state.message}` }, { quoted: message });
        return;
    }

    if (sub.toLowerCase() === 'setmsg') {
        const newMsg = rest.join(' ').trim();
        if (!newMsg) {
            await sock.sendMessage(chatId, { text: style.usage('usage', ['.pmblocker setmsg <message>']) }, { quoted: message });
            return;
        }
        writeState(state.enabled, newMsg);
        await sock.sendMessage(chatId, { text: style.ok('pm blocker message updated') }, { quoted: message });
        return;
    }

    const enable = sub.toLowerCase() === 'on';
    writeState(enable);
    await sock.sendMessage(chatId, { text: style.ok(`pm blocker is now ${enable ? 'enabled' : 'disabled'}`) }, { quoted: message });
}

module.exports = { pmblockerCommand, readState };

