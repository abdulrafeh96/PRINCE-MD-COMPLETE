const fs = require('fs');
const path = require('path');

// Function to load user and group data from JSON file
function loadUserGroupData() {
    try {
        const dataPath = path.join(__dirname, '../data/userGroupData.json');
        if (!fs.existsSync(dataPath)) {
            // Create the file with default structure if it doesn't exist
            const defaultData = {
                antibadword: {},
                antilink: {},
                antichannel: {},
                antisticker: {},
                schedule: {},
                chatLocks: {},
                welcome: {},
                chatbot: {},
                warnings: {},
                sudo: []
            };
            fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        return data;
    } catch (error) {
        console.error('Error loading user group data:', error);
        return {
            antibadword: {},
            antilink: {},
            antichannel: {},
            antisticker: {},
            schedule: {},
            chatLocks: {},
            welcome: {},
            chatbot: {},
            warnings: {}
        };
    }
}

// Function to save user and group data to JSON file
function saveUserGroupData(data) {
    try {
        const dataPath = path.join(__dirname, '../data/userGroupData.json');
        // Ensure the directory exists
        const dir = path.dirname(dataPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving user group data:', error);
        return false;
    }
}

// Add these functions to your SQL helper file
async function setAntilink(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antilink) data.antilink = {};
        if (!data.antilink[groupId]) data.antilink[groupId] = {};
        
        data.antilink[groupId] = {
            enabled: type === 'on',
            action: action || 'delete' // Set default action to delete
        };
        
        saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error setting antilink:', error);
        return false;
    }
}

async function getAntilink(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (!data.antilink || !data.antilink[groupId]) return null;
        
        return type === 'on' ? data.antilink[groupId] : null;
    } catch (error) {
        console.error('Error getting antilink:', error);
        return null;
    }
}

async function removeAntilink(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (data.antilink && data.antilink[groupId]) {
            delete data.antilink[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing antilink:', error);
        return false;
    }
}

// Add antitag functions
async function setAntitag(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antitag) data.antitag = {};
        if (!data.antitag[groupId]) data.antitag[groupId] = {};
        
        data.antitag[groupId] = {
            enabled: type === 'on',
            action: action || 'delete' // Set default action to delete
        };
        
        saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error setting antitag:', error);
        return false;
    }
}

async function getAntitag(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (!data.antitag || !data.antitag[groupId]) return null;
        
        return type === 'on' ? data.antitag[groupId] : null;
    } catch (error) {
        console.error('Error getting antitag:', error);
        return null;
    }
}

async function removeAntitag(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (data.antitag && data.antitag[groupId]) {
            delete data.antitag[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing antitag:', error);
        return false;
    }
}

async function setAntichannel(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antichannel) data.antichannel = {};
        data.antichannel[groupId] = {
            enabled: type === 'on',
            action: action || 'delete'
        };
        saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error setting antichannel:', error);
        return false;
    }
}

async function getAntichannel(groupId) {
    try {
        const data = loadUserGroupData();
        return data.antichannel?.[groupId] || null;
    } catch (error) {
        console.error('Error getting antichannel:', error);
        return null;
    }
}

async function removeAntichannel(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.antichannel && data.antichannel[groupId]) {
            delete data.antichannel[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing antichannel:', error);
        return false;
    }
}

async function setAntisticker(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antisticker) data.antisticker = {};
        data.antisticker[groupId] = {
            enabled: type === 'on',
            action: action || 'delete'
        };
        saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error setting antisticker:', error);
        return false;
    }
}

async function getAntisticker(groupId) {
    try {
        const data = loadUserGroupData();
        return data.antisticker?.[groupId] || null;
    } catch (error) {
        console.error('Error getting antisticker:', error);
        return null;
    }
}

async function removeAntisticker(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.antisticker && data.antisticker[groupId]) {
            delete data.antisticker[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing antisticker:', error);
        return false;
    }
}

// Add these functions for warning system
async function incrementWarningCount(groupId, userId) {
    try {
        const data = loadUserGroupData();
        if (!data.warnings) data.warnings = {};
        if (!data.warnings[groupId]) data.warnings[groupId] = {};
        if (!data.warnings[groupId][userId]) data.warnings[groupId][userId] = 0;
        
        data.warnings[groupId][userId]++;
        saveUserGroupData(data);
        return data.warnings[groupId][userId];
    } catch (error) {
        console.error('Error incrementing warning count:', error);
        return 0;
    }
}

async function resetWarningCount(groupId, userId) {
    try {
        const data = loadUserGroupData();
        if (data.warnings && data.warnings[groupId] && data.warnings[groupId][userId]) {
            data.warnings[groupId][userId] = 0;
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error resetting warning count:', error);
        return false;
    }
}

// Add sudo check function
async function isSudo(userId) {
    try {
        const data = loadUserGroupData();
        return data.sudo && data.sudo.includes(userId);
    } catch (error) {
        console.error('Error checking sudo:', error);
        return false;
    }
}

// Manage sudo users
async function addSudo(userJid) {
    try {
        const data = loadUserGroupData();
        if (!data.sudo) data.sudo = [];
        if (!data.sudo.includes(userJid)) {
            data.sudo.push(userJid);
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error adding sudo:', error);
        return false;
    }
}

async function removeSudo(userJid) {
    try {
        const data = loadUserGroupData();
        if (!data.sudo) data.sudo = [];
        const idx = data.sudo.indexOf(userJid);
        if (idx !== -1) {
            data.sudo.splice(idx, 1);
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing sudo:', error);
        return false;
    }
}

async function getSudoList() {
    try {
        const data = loadUserGroupData();
        return Array.isArray(data.sudo) ? data.sudo : [];
    } catch (error) {
        console.error('Error getting sudo list:', error);
        return [];
    }
}

// Add these functions
async function addWelcome(jid, enabled, message) {
    try {
        const data = loadUserGroupData();
        if (!data.welcome) data.welcome = {};
        
        data.welcome[jid] = {
            enabled: enabled,
            message: message || '╔═⚔️ WELCOME ⚔️═╗\n║ 🛡️ User: {user}\n║ 🏰 Group: {group}\n╠═══════════════╣\n║ 📜 Message:\n║ {description}\n╚═══════════════╝'
        };
        
        saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error in addWelcome:', error);
        return false;
    }
}

async function delWelcome(jid) {
    try {
        const data = loadUserGroupData();
        if (data.welcome && data.welcome[jid]) {
            delete data.welcome[jid];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error in delWelcome:', error);
        return false;
    }
}

async function isWelcomeOn(jid) {
    try {
        const data = loadUserGroupData();
        return data.welcome && data.welcome[jid] && data.welcome[jid].enabled;
    } catch (error) {
        console.error('Error in isWelcomeOn:', error);
        return false;
    }
}

async function getWelcome(jid) {
    try {
        const data = loadUserGroupData();
        return data.welcome && data.welcome[jid] ? data.welcome[jid].message : null;
    } catch (error) {
        console.error('Error in getWelcome:', error);
        return null;
    }
}

// Add these functions to your existing SQL helper file
async function setAntiBadword(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antibadword) data.antibadword = {};
        if (!data.antibadword[groupId]) data.antibadword[groupId] = {};
        
        data.antibadword[groupId] = {
            enabled: type === 'on',
            action: action || 'delete'
        };
        
        saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error setting antibadword:', error);
        return false;
    }
}

async function getAntiBadword(groupId, type) {
    try {
        const data = loadUserGroupData();
        //console.log('Loading antibadword config for group:', groupId);
        //console.log('Current data:', data.antibadword);
        
        if (!data.antibadword || !data.antibadword[groupId]) {
            console.log('No antibadword config found');
            return null;
        }
        
        const config = data.antibadword[groupId];
       // console.log('Found config:', config);
        
        return type === 'on' ? config : null;
    } catch (error) {
        console.error('Error getting antibadword:', error);
        return null;
    }
}

async function removeAntiBadword(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (data.antibadword && data.antibadword[groupId]) {
            delete data.antibadword[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing antibadword:', error);
        return false;
    }
}

async function setChatbot(groupId, enabled) {
    try {
        const data = loadUserGroupData();
        if (!data.chatbot) data.chatbot = {};
        
        data.chatbot[groupId] = {
            enabled: enabled
        };
        
        saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error setting chatbot:', error);
        return false;
    }
}

async function getChatbot(groupId) {
    try {
        const data = loadUserGroupData();
        return data.chatbot?.[groupId] || null;
    } catch (error) {
        console.error('Error getting chatbot:', error);
        return null;
    }
}

async function removeChatbot(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.chatbot && data.chatbot[groupId]) {
            delete data.chatbot[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing chatbot:', error);
        return false;
    }
}

async function setGroupSchedule(groupId, scheduleConfig) {
    try {
        const data = loadUserGroupData();
        if (!data.schedule) data.schedule = {};
        data.schedule[groupId] = {
            enabled: true,
            openTime: scheduleConfig.openTime || null,
            closeTime: scheduleConfig.closeTime || null,
            timezone: scheduleConfig.timezone || 'Asia/Karachi',
            lastOpenRun: scheduleConfig.lastOpenRun || null,
            lastCloseRun: scheduleConfig.lastCloseRun || null
        };
        saveUserGroupData(data);
        return data.schedule[groupId];
    } catch (error) {
        console.error('Error setting schedule:', error);
        return null;
    }
}

async function getGroupSchedule(groupId) {
    try {
        const data = loadUserGroupData();
        return data.schedule?.[groupId] || null;
    } catch (error) {
        console.error('Error getting schedule:', error);
        return null;
    }
}

async function getAllGroupSchedules() {
    try {
        const data = loadUserGroupData();
        return data.schedule || {};
    } catch (error) {
        console.error('Error getting all schedules:', error);
        return {};
    }
}

async function removeGroupSchedule(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.schedule && data.schedule[groupId]) {
            delete data.schedule[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing schedule:', error);
        return false;
    }
}

async function updateGroupScheduleMeta(groupId, patch) {
    try {
        const data = loadUserGroupData();
        if (!data.schedule || !data.schedule[groupId]) return null;
        data.schedule[groupId] = {
            ...data.schedule[groupId],
            ...patch
        };
        saveUserGroupData(data);
        return data.schedule[groupId];
    } catch (error) {
        console.error('Error updating schedule meta:', error);
        return null;
    }
}

function normalizeLockJid(jid = '') {
    return String(jid).split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
}

async function setChatLock(groupId, userId, enabled = true) {
    try {
        const data = loadUserGroupData();
        if (!data.chatLocks) data.chatLocks = {};
        if (!data.chatLocks[groupId]) data.chatLocks[groupId] = {};
        const key = normalizeLockJid(userId);
        if (!key) return false;
        data.chatLocks[groupId][key] = {
            jid: userId,
            enabled: !!enabled
        };
        saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error setting chat lock:', error);
        return false;
    }
}

async function removeChatLock(groupId, userId) {
    try {
        const data = loadUserGroupData();
        const key = normalizeLockJid(userId);
        if (!key || !data.chatLocks?.[groupId]?.[key]) return false;
        delete data.chatLocks[groupId][key];
        saveUserGroupData(data);
        return true;
    } catch (error) {
        console.error('Error removing chat lock:', error);
        return false;
    }
}

async function isChatLocked(groupId, userId) {
    try {
        const data = loadUserGroupData();
        const key = normalizeLockJid(userId);
        return !!(key && data.chatLocks?.[groupId]?.[key]?.enabled);
    } catch (error) {
        console.error('Error checking chat lock:', error);
        return false;
    }
}

async function getLockedUsers(groupId) {
    try {
        const data = loadUserGroupData();
        return Object.values(data.chatLocks?.[groupId] || {}).filter((item) => item?.enabled);
    } catch (error) {
        console.error('Error getting locked users:', error);
        return [];
    }
}

module.exports = {
    // ... existing exports
    setAntilink,
    getAntilink,
    removeAntilink,
    setAntitag,
    getAntitag,
    removeAntitag,
    setAntichannel,
    getAntichannel,
    removeAntichannel,
    setAntisticker,
    getAntisticker,
    removeAntisticker,
    incrementWarningCount,
    resetWarningCount,
    isSudo,
    addSudo,
    removeSudo,
    getSudoList,
    addWelcome,
    delWelcome,
    isWelcomeOn,
    getWelcome,
    setAntiBadword,
    getAntiBadword,
    removeAntiBadword,
    setChatbot,
    getChatbot,
    removeChatbot,
    setGroupSchedule,
    getGroupSchedule,
    getAllGroupSchedules,
    removeGroupSchedule,
    updateGroupScheduleMeta,
    setChatLock,
    removeChatLock,
    isChatLocked,
    getLockedUsers,
}; 

