const axios = require('axios');
const { sleep } = require('../lib/myfunc');

async function pairCommand(sock, chatId, message, q) {
    try {
        if (!q) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Valid WhatsApp number do!*\nUsage: `.pair 91702395XXXX`"
            });
        }

        const numbers = q.split(',')
            .map((v) => v.replace(/[^0-9]/g, ''))
            .filter((v) => v.length > 5 && v.length < 20);

        if (numbers.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "❌ *Invalid number!*\n_Example: `.pair 91702395XXXX`_"
            });
        }

        for (const number of numbers) {
            const whatsappID = number + '@s.whatsapp.net';
            const result = await sock.onWhatsApp(whatsappID);

            if (!result[0]?.exists) {
                return await sock.sendMessage(chatId, {
                    text: `❌ *Ye number WhatsApp par registered nahi hai!*`
                });
            }

            await sock.sendMessage(chatId, {
                text: "⏳ *Code generate ho raha hai...*"
            });

            try {
                const response = await axios.get(`https://knight-bot-paircode.onrender.com/code?number=${number}`);
                
                if (response.data && response.data.code) {
                    const code = response.data.code;
                    if (code === "Service Unavailable") {
                        throw new Error('Service Unavailable');
                    }
                    
                    await sleep(5000);
                    await sock.sendMessage(chatId, {
                        text: `🔐 *Your pairing code:* ${code}`
                    });
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (apiError) {
                console.error('API Error:', apiError);
                const errorMessage = apiError.message === 'Service Unavailable' 
                    ? "❌ *Service abhi unavailable hai!*"
                    : "❌ *Pairing code generate nahi ho saka!*";
                
                await sock.sendMessage(chatId, {
                    text: errorMessage
                });
            }
        }
    } catch (error) {
        console.error(error);
        await sock.sendMessage(chatId, {
            text: "❌ *Pair command error!*"
        });
    }
}

module.exports = pairCommand; 

