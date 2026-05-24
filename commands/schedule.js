const isAdmin = require('../lib/isAdmin');
const {
    setGroupSchedule,
    getGroupSchedule,
    getAllGroupSchedules,
    removeGroupSchedule,
    updateGroupScheduleMeta
} = require('../lib/index');
const { toSmallCaps } = require('../lib/eddyStyle');

const DEFAULT_TIMEZONE = 'Asia/Karachi';
const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const ICON = {
    chart: '\uD83D\uDCCA',
    open: '\uD83D\uDD13',
    close: '\uD83D\uDD12',
    clock: '\u23F0',
    calendar: '\uD83D\uDCC5',
    gear: '\u2699\uFE0F',
    ok: '\u2705',
    fail: '\u274C',
    sun: '\u2600\uFE0F',
    moon: '\uD83C\uDF19',
    book: '\uD83D\uDCD6',
    heart: '\uD83E\uDD0D',
    dua: '\uD83E\uDD32\uD83C\uDFFB'
};

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTime(value = '') {
    const trimmed = String(value).trim();
    const match = trimmed.match(TIME_RE);
    if (!match) return null;
    return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function getNowParts(timezone = DEFAULT_TIMEZONE) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const parts = Object.fromEntries(
        formatter.formatToParts(new Date()).map((part) => [part.type, part.value])
    );

    return {
        dateKey: `${parts.year}-${parts.month}-${parts.day}`,
        timeKey: `${parts.hour}:${parts.minute}`
    };
}

async function setGroupOpenState(sock, chatId, shouldOpen) {
    const setting = shouldOpen ? 'not_announcement' : 'announcement';
    const expectedAnnouncement = !shouldOpen;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
        await sock.groupSettingUpdate(chatId, setting);
        await wait(1200);

        const metadata = await sock.groupMetadata(chatId).catch(() => null);
        if (!metadata || typeof metadata.announce !== 'boolean') return true;
        if (metadata.announce === expectedAnnouncement) return true;
    }

    throw new Error(`group setting did not change to ${setting}`);
}

function scheduleStatusText(current) {
    const openTime = current?.openTime || toSmallCaps('not set');
    const closeTime = current?.closeTime || toSmallCaps('not set');
    const lastOpen = current?.lastOpenRun || toSmallCaps('not run');
    const lastClose = current?.lastCloseRun || toSmallCaps('not run');

    return [
        `${ICON.chart} *${toSmallCaps('auto open close status')}*`,
        '',
        `${ICON.open} *${toSmallCaps('auto open')}:* ${openTime}`,
        `${ICON.close} *${toSmallCaps('auto close')}:* ${closeTime}`,
        `${ICON.open} *${toSmallCaps('last open run')}:* ${lastOpen}`,
        `${ICON.close} *${toSmallCaps('last close run')}:* ${lastClose}`
    ].join('\n');
}

const dailyHadiths = [
    {
        arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
        translation: 'تم میں سب سے بہتر وہ شخص ہے جو قرآن سیکھے، اسے سمجھے، اس پر عمل کرے اور پھر دوسروں تک پہنچائے۔ اس حدیث میں علمِ قرآن کی فضیلت، تعلیم کی اہمیت اور نیکی کو آگے پھیلانے کا خوبصورت پیغام موجود ہے۔',
        reference: 'صحیح البخاری، کتاب فضائل القرآن، حدیث نمبر: 5027'
    },
    {
        arabic: 'مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ',
        translation: 'جو شخص کسی کو نیکی کی طرف رہنمائی کرے، اسے بھی اتنا ہی اجر ملتا ہے جتنا اس نیکی پر عمل کرنے والے کو ملتا ہے۔ اس سے معلوم ہوتا ہے کہ اچھی بات بتانا، علم بانٹنا اور خیر کی دعوت دینا بہت بڑی عبادت ہے۔',
        reference: 'صحیح مسلم، حدیث نمبر: 1893'
    },
    {
        arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
        translation: 'اعمال کا دارومدار نیتوں پر ہے۔ انسان کا ہر کام اللہ کے ہاں اسی نیت کے مطابق قبول ہوتا ہے جو اس کے دل میں ہو۔ اس لیے ہر دن کا آغاز اخلاص، سچائی اور اللہ کی رضا کی نیت سے کرنا چاہیے۔',
        reference: 'صحیح البخاری، حدیث نمبر: 1؛ صحیح مسلم، حدیث نمبر: 1907'
    },
    {
        arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
        translation: 'جو شخص علم حاصل کرنے کے راستے پر چلتا ہے، اللہ تعالیٰ اس کے لیے جنت کا راستہ آسان فرما دیتا ہے۔ اس حدیث سے علم حاصل کرنے، سوال پوچھنے، سیکھنے اور سکھانے کی عظمت واضح ہوتی ہے۔',
        reference: 'صحیح مسلم، حدیث نمبر: 2699'
    },
    {
        arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
        translation: 'مسلمان وہ ہے جس کی زبان اور ہاتھ سے دوسرے مسلمان محفوظ رہیں۔ اس حدیث میں اخلاق، نرم گفتگو، دوسروں کو تکلیف نہ دینے اور معاشرے میں امن قائم رکھنے کی تعلیم دی گئی ہے۔',
        reference: 'صحیح البخاری، حدیث نمبر: 10؛ صحیح مسلم، حدیث نمبر: 40'
    }
];

function getDailyItem(items, timezone = DEFAULT_TIMEZONE) {
    const { dateKey } = getNowParts(timezone);
    const sum = dateKey.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
    return items[sum % items.length];
}

function buildGroupOpenedMessage() {
    const hadith = getDailyItem(dailyHadiths);

    return [
        '〔 ☀️🌈 𝗚𝗢𝗢𝗗 𝗠𝗢𝗥𝗡𝗜𝗡𝗚 〕',
        '⏰ 𝐆𝐫𝐨𝐮𝐩 *is now* 🔓 𝐎𝐩𝐞𝐧',
        '',
        '',
        '                `ˢᵗᵃʳᵗ ʸᵒᵘʳ ᵈᵃʸ ʷⁱᵗʰ ᵈᵘʳᵒᵒᵈ ᵖᵃᵏ`',
        '',
        '',
        '*_❁بِسْــــــــــــــــــمِ اﷲِالرَّحْمَنِ اارَّحِيم❁۔_*🌕💗',
        '',
        '*_اَللّٰھُمَّ صَــّلِ عَلٰی ,مُحَمَّدٍ وَّعَلٰٓی اٰلِ مُحَمَّدٍ کَمَا صَلَّیْتَ عَلٰٓی اِبْرَاھِیْمَ وَعَلٰٓی اٰلِ اِبْرَاھِیْمَ اِنَّکَ حَمِیْدٌ مَّجِیْدٌ_*༘⋆🌷🫧💭🪄₊˚ෆ',
        '',
        ' *_اَللّٰھُمَّ بَارِکْ عَلٰی مُحَمَّدٍ وَّعَلٰٓی اٰلِ مُحَمَّدٍ کَمَا بَارَکْتَ عَلٰٓی اِبْرَاھِیْمَ وَعَلٰٓی اٰلِ اِبْرَاھِیْمَ اِنَّکَ حَمِیْدٌ مَّجِیْدٌ،_*˖𓍢ִ໋🌈͙֒✧˚.🌊✨༘',
        '',
        '*📖 حدیث شریف:*',
        `*${hadith.arabic}*`,
        `*ترجمہ:* _${hadith.translation}_`,
        `*حوالہ:* ${hadith.reference}`,
        '',
        '⋆｡‧˚ʚɞ˚‧｡⋆🤍🌻🌊🍄‍🟫'
    ].join('\n');
}

function buildGroupClosedMessage() {
    return [
        '〔 🌙✨ 𝗚𝗢𝗢𝗗 𝗡𝗜𝗚𝗛𝗧 〕',
        '⏰ 𝐆𝐫𝐨𝐮𝐩 *is now* 🔒 𝐂𝐥𝐨𝐬𝐞𝐝',
        '',
        '',
        '**بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْم** 🌙🤍',
        '',
        '**اَلَا بِذِكْرِ اللّٰهِ تَطْمَئِنُّ الْقُلُوْبُ**',
        '*“Indeed, in the remembrance of Allah do hearts find peace.”* 🤍✨',
        '— *(Surah Ar-Ra’d 13:28)*',
        '',
        '**اللّٰهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا** 🌌💫',
        '',
        '**اَللّٰهُمَّ احْفَظْنَا طُوْلَ اللَّيْلِ وَارْزُقْنَا نَوْمًا هَادِئًا وَقَلْبًا مُطْمَئِنًّا** 🤲🏻🌷',
        '',
        '⋆｡‧˚ʚɞ˚‧｡⋆🌙⭐☁️🕊️'
    ].join('\n');
}

async function requireScheduleAccess(sock, chatId, senderId, isSenderAdmin, message) {
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: `${ICON.fail} *${toSmallCaps('this command is for groups only')}*` }, { quoted: message });
        return false;
    }

    const adminStatus = await isAdmin(sock, chatId, senderId);
    if (!adminStatus.isBotAdmin) {
        await sock.sendMessage(chatId, { text: `${ICON.fail} *${toSmallCaps('make bot admin first')}*` }, { quoted: message });
        return false;
    }

    if (!isSenderAdmin && !message.key.fromMe) {
        await sock.sendMessage(chatId, { text: `${ICON.fail} *${toSmallCaps('only group admins can use this command')}*` }, { quoted: message });
        return false;
    }

    return true;
}

async function saveSchedulePart(chatId, part, time) {
    const current = await getGroupSchedule(chatId) || {};
    return setGroupSchedule(chatId, {
        openTime: part === 'open' ? time : current.openTime || null,
        closeTime: part === 'close' ? time : current.closeTime || null,
        timezone: current.timezone || DEFAULT_TIMEZONE,
        lastOpenRun: part === 'open' ? null : current.lastOpenRun || null,
        lastCloseRun: part === 'close' ? null : current.lastCloseRun || null
    });
}

async function removeSchedulePart(chatId, part) {
    const current = await getGroupSchedule(chatId) || {};
    const next = {
        openTime: part === 'open' ? null : current.openTime || null,
        closeTime: part === 'close' ? null : current.closeTime || null,
        timezone: current.timezone || DEFAULT_TIMEZONE,
        lastOpenRun: current.lastOpenRun || null,
        lastCloseRun: current.lastCloseRun || null
    };

    if (!next.openTime && !next.closeTime) {
        await removeGroupSchedule(chatId);
        return null;
    }

    return setGroupSchedule(chatId, next);
}

async function handleAutoOpenCommand(sock, chatId, rawArgs, senderId, isSenderAdmin, message) {
    try {
        if (!await requireScheduleAccess(sock, chatId, senderId, isSenderAdmin, message)) return;
        const timeArg = rawArgs[0];

        if (timeArg) {
            if (['off', 'remove', 'delete'].includes(timeArg.toLowerCase())) {
                await removeSchedulePart(chatId, 'open');
                await sock.sendMessage(chatId, { text: `${ICON.ok} *${toSmallCaps('auto open time removed')}*` }, { quoted: message });
                return;
            }

            const time = normalizeTime(timeArg);
            if (!time) {
                await sock.sendMessage(chatId, {
                    text: `${ICON.fail} *${toSmallCaps('invalid time format')}*\n${toSmallCaps('use 24 hour format like 09:00 or 14:00')}`
                }, { quoted: message });
                return;
            }

            await saveSchedulePart(chatId, 'open', time);
            await sock.sendMessage(chatId, {
                text: `${ICON.ok} *${toSmallCaps('auto open time set')}*\n\n` +
                    `${ICON.clock} *${toSmallCaps('group will open daily at')}:* ${time}\n` +
                    `${ICON.calendar} *${toSmallCaps('every day')}*`
            }, { quoted: message });
            return;
        }

        await setGroupOpenState(sock, chatId, true);
        await sock.sendMessage(chatId, { text: buildGroupOpenedMessage() }, { quoted: message });
        await sock.sendMessage(chatId, { text: `${ICON.ok} *${toSmallCaps('group opened successfully')}*` }, { quoted: message });
    } catch (error) {
        console.error('Autoopen error:', error);
        await sock.sendMessage(chatId, { text: `${ICON.fail} *${toSmallCaps('failed to open group make sure bot is admin')}*` }, { quoted: message });
    }
}

async function handleAutoCloseCommand(sock, chatId, rawArgs, senderId, isSenderAdmin, message) {
    try {
        if (!await requireScheduleAccess(sock, chatId, senderId, isSenderAdmin, message)) return;
        const timeArg = rawArgs[0];

        if (timeArg) {
            if (['off', 'remove', 'delete'].includes(timeArg.toLowerCase())) {
                await removeSchedulePart(chatId, 'close');
                await sock.sendMessage(chatId, { text: `${ICON.ok} *${toSmallCaps('auto close time removed')}*` }, { quoted: message });
                return;
            }

            const time = normalizeTime(timeArg);
            if (!time) {
                await sock.sendMessage(chatId, {
                    text: `${ICON.fail} *${toSmallCaps('invalid time format')}*\n${toSmallCaps('use 24 hour format like 09:00 or 14:00')}`
                }, { quoted: message });
                return;
            }

            await saveSchedulePart(chatId, 'close', time);
            await sock.sendMessage(chatId, {
                text: `${ICON.ok} *${toSmallCaps('auto close time set')}*\n\n` +
                    `${ICON.clock} *${toSmallCaps('group will close daily at')}:* ${time}\n` +
                    `${ICON.calendar} *${toSmallCaps('every day')}*`
            }, { quoted: message });
            return;
        }

        await setGroupOpenState(sock, chatId, false);
        await sock.sendMessage(chatId, { text: buildGroupClosedMessage() }, { quoted: message });
        await sock.sendMessage(chatId, { text: `${ICON.ok} *${toSmallCaps('group closed successfully')}*` }, { quoted: message });
    } catch (error) {
        console.error('Autoclose error:', error);
        await sock.sendMessage(chatId, { text: `${ICON.fail} *${toSmallCaps('failed to close group make sure bot is admin')}*` }, { quoted: message });
    }
}

async function handleAutoStatusCommand(sock, chatId, senderId, isSenderAdmin, message) {
    try {
        if (!await requireScheduleAccess(sock, chatId, senderId, isSenderAdmin, message)) return;
        const current = await getGroupSchedule(chatId);
        await sock.sendMessage(chatId, { text: scheduleStatusText(current) }, { quoted: message });
    } catch (error) {
        console.error('Autostatus error:', error);
        await sock.sendMessage(chatId, { text: `${ICON.fail} *${toSmallCaps('failed to fetch schedule status')}*` }, { quoted: message });
    }
}

async function handleScheduleCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!await requireScheduleAccess(sock, chatId, senderId, isSenderAdmin, message)) return;

        const args = userMessage.trim().split(/\s+/).slice(1);
        const action = (args[0] || '').toLowerCase();

        if (!action || action === 'help') {
            const usage = [
                `${ICON.chart} *${toSmallCaps('auto open close setup')}*`,
                '',
                `${ICON.gear} *${toSmallCaps('single commands')}*`,
                '.autoopen 09:00',
                '.autoclose 22:00',
                '.autostatus',
                '.autoopen off',
                '.autoclose off',
                '',
                `${ICON.calendar} *${toSmallCaps('schedule commands')}*`,
                '.schedule add 09:00 22:00',
                '.schedule status',
                '.schedule off',
                '.schedule open',
                '.schedule close'
            ].join('\n');
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        if (action === 'add' || action === 'set' || action === 'on') {
            const openTime = normalizeTime(args[1]);
            const closeTime = normalizeTime(args[2]);

            if (!openTime || !closeTime) {
                await sock.sendMessage(chatId, {
                    text: `${ICON.fail} *${toSmallCaps('invalid time format')}*\n${toSmallCaps('use')}: .schedule add 09:00 22:00`
                }, { quoted: message });
                return;
            }

            await setGroupSchedule(chatId, {
                openTime,
                closeTime,
                timezone: DEFAULT_TIMEZONE,
                lastOpenRun: null,
                lastCloseRun: null
            });

            await sock.sendMessage(chatId, {
                text: `${ICON.ok} *${toSmallCaps('auto schedule enabled')}*\n\n` +
                    `${ICON.open} *${toSmallCaps('group will open daily at')}:* ${openTime}\n` +
                    `${ICON.close} *${toSmallCaps('group will close daily at')}:* ${closeTime}\n` +
                    `${ICON.calendar} *${toSmallCaps('every day')}*`
            }, { quoted: message });
            return;
        }

        if (action === 'status') {
            const current = await getGroupSchedule(chatId);
            await sock.sendMessage(chatId, { text: scheduleStatusText(current) }, { quoted: message });
            return;
        }

        if (action === 'off' || action === 'disable' || action === 'remove') {
            await removeGroupSchedule(chatId);
            await sock.sendMessage(chatId, {
                text: `${ICON.ok} *${toSmallCaps('auto schedule disabled')}*\n\n` +
                    `${ICON.open} *${toSmallCaps('auto open')}:* ${toSmallCaps('not set')}\n` +
                    `${ICON.close} *${toSmallCaps('auto close')}:* ${toSmallCaps('not set')}`
            }, { quoted: message });
            return;
        }

        if (action === 'open') {
            await handleAutoOpenCommand(sock, chatId, args.slice(1), senderId, isSenderAdmin, message);
            return;
        }

        if (action === 'close') {
            await handleAutoCloseCommand(sock, chatId, args.slice(1), senderId, isSenderAdmin, message);
            return;
        }

        await sock.sendMessage(chatId, { text: `${ICON.fail} *${toSmallCaps('invalid action')}*\n${toSmallCaps('use .schedule help')}` }, { quoted: message });
    } catch (error) {
        console.error('Error in schedule command:', error);
        await sock.sendMessage(chatId, { text: `${ICON.fail} *${toSmallCaps('error processing schedule command')}*` }, { quoted: message });
    }
}

async function runScheduleTick(sock) {
    try {
        const schedules = await getAllGroupSchedules();
        const entries = Object.entries(schedules || {});

        for (const [groupId, config] of entries) {
            if (!config?.enabled) continue;
            if (!config.openTime && !config.closeTime) continue;

            const timezone = config.timezone || DEFAULT_TIMEZONE;
            const { dateKey, timeKey } = getNowParts(timezone);

            if (config.openTime === timeKey && config.lastOpenRun !== dateKey) {
                try {
                    await setGroupOpenState(sock, groupId, true);
                    await sock.sendMessage(groupId, { text: buildGroupOpenedMessage() });
                    await updateGroupScheduleMeta(groupId, { lastOpenRun: dateKey });
                } catch (error) {
                    console.error(`Schedule open error for ${groupId}:`, error);
                }
            }

            if (config.closeTime === timeKey && config.lastCloseRun !== dateKey) {
                try {
                    await setGroupOpenState(sock, groupId, false);
                    await sock.sendMessage(groupId, { text: buildGroupClosedMessage() });
                    await updateGroupScheduleMeta(groupId, { lastCloseRun: dateKey });
                } catch (error) {
                    console.error(`Schedule close error for ${groupId}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error in schedule tick:', error);
    }
}

module.exports = {
    handleScheduleCommand,
    handleAutoOpenCommand,
    handleAutoCloseCommand,
    handleAutoStatusCommand,
    runScheduleTick
};
