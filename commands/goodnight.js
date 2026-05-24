const { toSmallCaps } = require('../lib/eddyStyle');

module.exports = {
    goodnightCommand: async function (sock, chatId, message) {
        const text =
`🌙✨ *${toSmallCaps('good night')}*

**بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْم** 🌙🤍

**اَلَا بِذِكْرِ اللّٰهِ تَطْمَئِنُّ الْقُلُوْبُ**
*“Indeed, in the remembrance of Allah do hearts find peace.”* 🤍✨
— *(Surah Ar-Ra’d 13:28)*

**اللّٰهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا** 🌌💫

**اَللّٰهُمَّ احْفَظْنَا طُوْلَ اللَّيْلِ وَارْزُقْنَا نَوْمًا هَادِئًا وَقَلْبًا مُطْمَئِنًّا** 🤲🏻🌷

⋆｡‧˚ʚɞ˚‧｡⋆🌙⭐☁️🕊️`;

        await sock.sendMessage(chatId, { text }, { quoted: message });
    }
};
