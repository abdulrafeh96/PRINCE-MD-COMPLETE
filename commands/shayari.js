const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');

const poetry = [
    {
        poet: 'علامہ اقبال',
        poetKeys: ['iqbal', 'allama iqbal', 'علامہ', 'اقبال'],
        title: 'ستاروں سے آگے',
        titleKeys: ['sitaron se aage', 'sitara', 'ستاروں سے آگے', 'ستاروں'],
        kind: 'غزل',
        lines: [
            'ستاروں سے آگے جہاں اور بھی ہیں',
            'ابھی عشق کے امتحاں اور بھی ہیں',
            '',
            'تہی زندگی سے نہیں یہ فضائیں',
            'یہاں سیکڑوں کارواں اور بھی ہیں',
            '',
            'قناعت نہ کر عالمِ رنگ و بو پر',
            'چمن اور بھی، آشیاں اور بھی ہیں',
            '',
            'اگر کھو گیا اک نشیمن تو کیا غم',
            'مقاماتِ آہ و فغاں اور بھی ہیں',
            '',
            'تو شاہیں ہے پرواز ہے کام تیرا',
            'ترے سامنے آسماں اور بھی ہیں'
        ]
    },
    {
        poet: 'علامہ اقبال',
        poetKeys: ['iqbal', 'allama iqbal', 'علامہ', 'اقبال'],
        title: 'شکوہ',
        titleKeys: ['shikwa', 'شکوہ'],
        kind: 'نظم',
        lines: [
            'کیوں زیاں کار بنوں، سود فراموش رہوں',
            'فکرِ فردا نہ کروں، محوِ غمِ دوش رہوں',
            '',
            'نالے بلبل کے سنوں اور ہمہ تن گوش رہوں',
            'ہم نوا میں بھی کوئی گل ہوں کہ خاموش رہوں',
            '',
            'جرأت آموز مری تابِ سخن ہے مجھ کو',
            'شکوہ اللہ سے خاکم بدہن ہے مجھ کو',
            '',
            'ہے بجا شیوۂ تسلیم میں مشہور ہیں ہم',
            'قصۂ درد سناتے ہیں کہ مجبور ہیں ہم',
            '',
            'ساز خاموش ہیں، فریاد سے معمور ہیں ہم',
            'نالہ آتا ہے اگر لب پہ تو معذور ہیں ہم'
        ]
    },
    {
        poet: 'مرزا غالب',
        poetKeys: ['ghalib', 'mirza ghalib', 'غالب', 'مرزا غالب'],
        title: 'دلِ ناداں',
        titleKeys: ['dil e nadan', 'dil nadan', 'دل ناداں', 'دلِ ناداں'],
        kind: 'غزل',
        lines: [
            'دلِ ناداں تجھے ہوا کیا ہے',
            'آخر اس درد کی دوا کیا ہے',
            '',
            'ہم ہیں مشتاق اور وہ بیزار',
            'یا الٰہی یہ ماجرا کیا ہے',
            '',
            'میں بھی منہ میں زبان رکھتا ہوں',
            'کاش پوچھو کہ مدعا کیا ہے',
            '',
            'جب کہ تجھ بن نہیں کوئی موجود',
            'پھر یہ ہنگامہ اے خدا کیا ہے',
            '',
            'سبزہ و گل کہاں سے آئے ہیں',
            'ابر کیا چیز ہے، ہوا کیا ہے'
        ]
    },
    {
        poet: 'مرزا غالب',
        poetKeys: ['ghalib', 'mirza ghalib', 'غالب', 'مرزا غالب'],
        title: 'ہزاروں خواہشیں',
        titleKeys: ['hazaron khwahishen', 'hazaro khwahishen', 'ہزاروں خواہشیں', 'خواہشیں'],
        kind: 'غزل',
        lines: [
            'ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے',
            'بہت نکلے مرے ارمان لیکن پھر بھی کم نکلے',
            '',
            'ڈرے کیوں میرا قاتل کیا رہے گا اس کی گردن پر',
            'وہ خوں جو چشمِ تر سے عمر بھر یوں دم بہ دم نکلے',
            '',
            'نکلنا خلد سے آدم کا سنتے آئے ہیں لیکن',
            'بہت بے آبرو ہو کر ترے کوچے سے ہم نکلے',
            '',
            'محبت میں نہیں ہے فرق جینے اور مرنے کا',
            'اسی کو دیکھ کر جیتے ہیں جس کافر پہ دم نکلے'
        ]
    },
    {
        poet: 'میر تقی میر',
        poetKeys: ['meer', 'mir', 'mir taqi mir', 'میر', 'میر تقی میر'],
        title: 'پتا پتا بوٹا بوٹا',
        titleKeys: ['patta patta', 'pata pata', 'پتا پتا', 'بوٹا بوٹا'],
        kind: 'غزل',
        lines: [
            'پتا پتا بوٹا بوٹا حال ہمارا جانے ہے',
            'جانے نہ جانے گل ہی نہ جانے، باغ تو سارا جانے ہے',
            '',
            'لگنے نہ دے بس ہو تو اس کے گوہرِ گوش کو بالے تک',
            'اس کو فلک چشمِ مہ و خور کی پتلی کا تارا جانے ہے',
            '',
            'آگے اس متکبر کے ہم خدا خدا کیا کرتے ہیں',
            'کب موجود خدا کو وہ مغرور خود آرا جانے ہے',
            '',
            'کیا کیا فتنے سر پر اس کے لاتا ہے معشوق اپنا',
            'جس بے دل بے تاب و تواں کو عشق کا مارا جانے ہے'
        ]
    },
    {
        poet: 'داغ دہلوی',
        poetKeys: ['dagh', 'daagh', 'dagh dehlvi', 'داغ', 'داغ دہلوی'],
        title: 'پردہ',
        titleKeys: ['parda', 'pardah', 'پردہ', 'چلمن'],
        kind: 'غزل',
        lines: [
            'خوب پردہ ہے کہ چلمن سے لگے بیٹھے ہیں',
            'صاف چھپتے بھی نہیں، سامنے آتے بھی نہیں',
            '',
            'دیکھتے ہی مجھے محفل میں یہ ارشاد ہوا',
            'کون بیٹھا ہے؟ اسے لوگ اٹھاتے بھی نہیں',
            '',
            'ہو چکا قطع تعلق تو جفائیں کیوں ہوں',
            'جن کو مطلب نہیں رہتا وہ ستاتے بھی نہیں',
            '',
            'زیست سے تنگ ہو اے داغ تو جیتے کیوں ہو',
            'جان پیاری بھی نہیں، جان سے جاتے بھی نہیں'
        ]
    },
    {
        poet: 'حسرت موہانی',
        poetKeys: ['hasrat', 'hasrat mohani', 'حسرت', 'حسرت موہانی'],
        title: 'چپکے چپکے',
        titleKeys: ['chupke chupke', 'چپکے چپکے'],
        kind: 'غزل',
        lines: [
            'چپکے چپکے رات دن آنسو بہانا یاد ہے',
            'ہم کو اب تک عاشقی کا وہ زمانا یاد ہے',
            '',
            'باہزاراں اضطراب و صد ہزاراں اشتیاق',
            'تجھ سے وہ پہلے پہل دل کا لگانا یاد ہے',
            '',
            'بار بار اٹھنا اسی جانب نگاہِ شوق کا',
            'اور ترا غرفے سے وہ آنکھیں لڑانا یاد ہے',
            '',
            'کھینچ لینا وہ مرا پردے کا کونا دفعتاً',
            'اور دوپٹے سے ترا وہ منہ چھپانا یاد ہے'
        ]
    }
];

const modernPoetNotes = [
    {
        keys: ['jaun', 'jaun elia', 'جون', 'جون ایلیا'],
        message: [
            '╭─〔 🖤 *اردو پوئٹری* 🖤 〕',
            '│ ✍🏻 *شاعر:* جون ایلیا',
            '╰────────────────',
            '',
            'جون ایلیا کا مکمل کلام جدید کاپی رائٹ میں آتا ہے، اس لیے پوری اصل غزل نہیں بھیج سکتا۔',
            'آپ چاہیں تو `.poetry iqbal`, `.poetry ghalib`, `.poetry meer`, `.poetry dagh` یا `.poetry hasrat` لکھیں، ان کے public-domain کلام سے بڑی غزل/نظم آ جائے گی۔',
            '',
            '⋆｡‧˚ʚɞ˚‧｡⋆ 🖤🥀✨'
        ].join('\n')
    }
];

function getCommandText(message, fallback = '') {
    return (
        fallback ||
        message?.message?.conversation ||
        message?.message?.extendedTextMessage?.text ||
        message?.message?.imageMessage?.caption ||
        message?.message?.videoMessage?.caption ||
        ''
    ).trim();
}

function normalize(value = '') {
    return String(value)
        .toLowerCase()
        .replace(/[۔،,.:;'"`*_~()[\]{}!?؟]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function saveTts(text, language = 'ur') {
    return new Promise((resolve, reject) => {
        const dir = path.join(__dirname, '..', 'assets');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const filePath = path.join(dir, `poetry-voice-${Date.now()}.mp3`);
        const tts = new gTTS(text, language);
        tts.save(filePath, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(filePath);
        });
    });
}

async function sendPoetryVoice(sock, chatId, message, item) {
    const voiceText = [
        item.title,
        item.poet,
        '',
        item.lines.filter(Boolean).join('\n')
    ].join('\n').slice(0, 3500);

    let filePath = '';
    try {
        filePath = await saveTts(voiceText, 'hi');
        await sock.sendMessage(chatId, {
            audio: { url: filePath },
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: message });
    } catch (error) {
        console.error('Poetry voice failed:', error.message || error);
    } finally {
        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (_) {}
        }
    }
}

function findPoetry(query = '') {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return pickRandom(poetry);

    const byTitle = poetry.find((item) =>
        item.titleKeys.some((key) => normalizedQuery.includes(normalize(key)))
    );
    if (byTitle) return byTitle;

    const byPoet = poetry.filter((item) =>
        item.poetKeys.some((key) => normalizedQuery.includes(normalize(key)))
    );
    if (byPoet.length > 0) return pickRandom(byPoet);

    return null;
}

function findModernPoetNote(query = '') {
    const normalizedQuery = normalize(query);
    return modernPoetNotes.find((item) =>
        item.keys.some((key) => normalizedQuery.includes(normalize(key)))
    );
}

function buildPoetryText(item) {
    return [
        '╭─〔 🌹 *اردو پوئٹری* 🌹 〕',
        `│ ✍🏻 *شاعر:* ${item.poet}`,
        `│ 📜 *${item.kind}:* ${item.title}`,
        '╰────────────────',
        '',
        item.lines.join('\n'),
        '',
        '⋆｡‧˚ʚɞ˚‧｡⋆ 🖤🥀✨'
    ].join('\n');
}

function buildNotFoundText(query) {
    return [
        '╭─〔 🌹 *اردو پوئٹری* 🌹 〕',
        '│ ❌ *کلام نہیں ملا*',
        '╰────────────────',
        '',
        `_${query}_ کے لیے saved ghazal/nazm nahi mili.`,
        '',
        '*Examples:*',
        '.poetry iqbal',
        '.poetry ghalib',
        '.poetry dil nadan',
        '.poetry hazaron khwahishen',
        '.poetry shikwa',
        '.poetry chupke chupke',
        '',
        '⋆｡‧˚ʚɞ˚‧｡⋆ 🖤🥀✨'
    ].join('\n');
}

async function poetryCommand(sock, chatId, message, commandText = '') {
    const text = getCommandText(message, commandText);
    const query = text.replace(/^\.?(poetry|shayari|shayri)\b/i, '').trim();
    const modernNote = findModernPoetNote(query);

    if (modernNote) {
        await sock.sendMessage(chatId, { text: modernNote.message }, { quoted: message });
        return;
    }

    const item = findPoetry(query);
    await sock.sendMessage(chatId, {
        text: item ? buildPoetryText(item) : buildNotFoundText(query || 'random')
    }, { quoted: message });

    if (item) {
        await sendPoetryVoice(sock, chatId, message, item);
    }
}

module.exports = {
    poetryCommand,
    shayariCommand: poetryCommand
};
