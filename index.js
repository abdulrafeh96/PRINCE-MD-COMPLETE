/**
 * Prince 2.0 - A WhatsApp Bot
 * Copyright (c) 2024 Professor
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * 
 * Credits:
 * - Baileys Library by @adiwajshing
 * - Pair Code implementation inspired by TechGod143 & DGXEON
 */
require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { google } = require('googleapis')
const QRCode = require('qrcode')
const qrcodeTerminal = require('qrcode-terminal')
const { exec } = require('child_process')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
// Using a lightweight persisted store instead of makeInMemoryStore (compat across versions)
const pino = require("pino")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')
const style = require('./lib/eddyStyle')

// Import lightweight store
const store = require('./lib/lightweight_store')

// Initialize store
store.readFromFile()
const settings = require('./settings')
const { runScheduleTick } = require('./commands/schedule');
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

const DRIVE_API_KEY = "AIzaSyDhJCdx5SWH2nNikcg4mRMmdCiqyUy7m70"
const DRIVE_FOLDER_ID = "1sEKZ3yIqKwdXzlIQcqF7aEo7sCBGpApq"
const DRIVE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder"
const STUDENTS_GROUP_LINK = "https://chat.whatsapp.com/DWDY0Fw7wod3WGeNVoaqRB"
const COMMAND_PREFIX = "!"
const FILES_PER_SUBJECT_LIMIT = 3
const FILE_SEND_DELAY_MS = 2000
const TERM_FILES_DEBUG = true

const drive = google.drive({
    version: "v3",
    auth: DRIVE_API_KEY
})
const recentFileRequests = new Map()
const termFileMoreOffsets = new Map()
let currentSocket = null
let reconnectTimer = null
let isStarting = false
let scheduleInterval = null

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function ensureScheduleRunner() {
    if (scheduleInterval) return
    scheduleInterval = setInterval(async () => {
        if (!currentSocket) return
        try {
            await runScheduleTick(currentSocket)
        } catch (error) {
            console.error('Schedule runner error:', error)
        }
    }, 30000)
}

function scheduleReconnect(reason) {
    if (reconnectTimer || isStarting) return
    console.log(chalk.yellow(`Reconnecting in 5 seconds... Reason: ${reason}`))
    reconnectTimer = setTimeout(async () => {
        reconnectTimer = null
        try {
            await startXeonBotInc()
        } catch (error) {
            console.error('Reconnect error:', error)
        }
    }, 5000)
}

function debugTermFiles(...args) {
    if (!TERM_FILES_DEBUG) return
    console.log("[TERM_FILES_DEBUG]", ...args)
}

function toBotSmallCaps(text = "") {
    const map = {
        a: "\u1D00",
        b: "\u0299",
        c: "\u1D04",
        d: "\u1D05",
        e: "\u1D07",
        f: "\uA730",
        g: "\u0262",
        h: "\u029C",
        i: "\u026A",
        j: "\u1D0A",
        k: "\u1D0B",
        l: "\u029F",
        m: "\u1D0D",
        n: "\u0274",
        o: "\u1D0F",
        p: "\u1D18",
        q: "q",
        r: "\u0280",
        s: "s",
        t: "\u1D1B",
        u: "\u1D1C",
        v: "\u1D20",
        w: "\u1D21",
        x: "x",
        y: "\u028F",
        z: "\u1D22"
    }

    const placeholders = []
    const protectedText = String(text || "").replace(/https?:\/\/\S+|chat\.whatsapp\.com\/\S+/gi, (match) => {
        const token = `__URL_${placeholders.length}__`
        placeholders.push(match)
        return token
    })

    const converted = protectedText
        .split("")
        .map((char) => map[char.toLowerCase()] || char)
        .join("")

    return placeholders.reduce((output, value, index) => output.replace(`__URL_${index}__`, value), converted)
}

function shouldEddyWrap(text = "") {
    const value = String(text).trim()
    if (!value || value.length > 220) return false
    if (/https?:\/\/|chat\.whatsapp\.com|\n.*\n.*\n/s.test(value)) return false
    if (/^(\*|_|`|>|\u3014|\u256d|\u2705|\u274c|\u26a0\ufe0f|\u2728|\ud83d\udd13|\ud83d\udd12|\u23f0|\ud83c\udf19|\u2600\ufe0f)/u.test(value)) return false
    return /^(please|only|this command|failed|invalid|usage|no |not |sorry|error|an error|bot |group |the group|auto-|pm blocker|anticall|warning|successfully|added|removed|deleted|profile|sticker|channel|link)/i.test(value)
}

function toEddyOutgoingText(text = "") {
    const value = String(text)
    const small = toBotSmallCaps(value)
    if (!shouldEddyWrap(value)) return small

    if (/^(failed|error|an error|invalid|only|this command|sorry|bot must|please make)/i.test(value)) {
        return `\u274c *${small}*`
    }
    if (/^(please|usage|no |not |warning)/i.test(value)) {
        return `\u26a0\ufe0f *${small}*`
    }
    return `\u2705 *${small}*`
}
function enableSmallCapsMessages(sock) {
    if (!sock || sock.__smallCapsMessagesEnabled) return
    const originalSendMessage = sock.sendMessage.bind(sock)
    sock.sendMessage = async (jid, content = {}, options = {}) => {
        if (content && typeof content === "object") {
            content = { ...content }
            if (typeof content.text === "string") content.text = toBotSmallCaps(content.text)
            if (typeof content.caption === "string") content.caption = toBotSmallCaps(content.caption)
        }
        return originalSendMessage(jid, content, options)
    }
    sock.__smallCapsMessagesEnabled = true
}

function escapeDriveQueryValue(value = "") {
    return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")
}

function normalizeLookupText(value = "") {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
}

function getSubjectCodes(text = "") {
    const matches = text.match(/[a-zA-Z]{2,4}\d{3}/g) || []
    return [...new Set(matches.map((match) => match.toUpperCase()))]
}

function buildMoreFilesCommand(termType, subject) {
    return `${COMMAND_PREFIX}more files ${termType} ${subject}`
}

function getTermFilesOffsetKey(sender, termType, subject) {
    return `${sender}|${termType}|${subject}`
}

function buildMoreFilesHints(moreSubjects = [], termType) {
    if (moreSubjects.length === 0) return []

    return [
        "",
        "More files chahiye hon to ye command bhejo:",
        ...moreSubjects.map((subject) => `➡️ ${buildMoreFilesCommand(termType, subject)}`)
    ]
}

function isMoreFilesRequest(text = "") {
    return new RegExp(`^\\s*\\${COMMAND_PREFIX}?\\s*more\\s+files\\b`, "i").test(text)
}

function detectTermType(text = "") {
    const normalized = normalizeLookupText(text)
    if (/\b(mid(?: term)?|mid-term|midterm)\b/.test(normalized)) return "mid"
    if (/\b(final(?: term)?|final-term|finalterm)\b/.test(normalized)) return "final"
    return null
}

function getTermFolderKeywords(termType) {
    if (termType === "mid") return ["mid term", "midterm", "mid-term", "mid terms"]
    if (termType === "final") return ["final term", "finalterm", "final-term", "final terms"]
    return []
}

function buildSupportFooter() {
    return [
        "━━━━━━━━━━━━━━",
        "Students Support Group",
        STUDENTS_GROUP_LINK
    ].join("\n")
}

function buildDeliveryReport({ type, subject, totalSent, moreSubjects = [], termType }) {
    return [
        "╭─〔 *DELIVERY REPORT* 〕",
        "",
        "✅  Status: *Delivered*",
        `📂  Type: *${type}*`,
        `📚  Subject: *${subject}*`,
        `📦  Total Sent: *${totalSent}*`,
        "",
        "Files pohanch gayi ne, paaji.",
        "Check kar lo, sab ready hai.",
        ...buildMoreFilesHints(moreSubjects, termType),
        "",
        "╰────────────────",
        buildSupportFooter()
    ].join("\n")
}

function buildFileStatusReport({ type, subject }) {
    return [
        "╭─〔 *FILE STATUS* 〕",
        "",
        "⛔  Status: *Not Available*",
        `📂  Type: *${type}*`,
        `📚  Subject: *${subject}*`,
        "",
        "File abhi Drive mein upload nahi hui.",
        "Jaldi add ho jaye gi, thora sabar karo.",
        "",
        "╰────────────────",
        buildSupportFooter()
    ].join("\n")
}

function buildHandoutsReport({ subject, totalSent }) {
    return [
        "╭─〔 *HANDOUTS DELIVERED* 〕",
        "",
        "✅  Status: *Delivered*",
        `📘  Subject: *${subject}*`,
        `📦  Handouts Sent: *${totalSent}*`,
        "",
        "Handouts pohanch gaye ne, paaji.",
        "Parhai shuru karo, scene set hai.",
        "",
        "╰────────────────",
        buildSupportFooter()
    ].join("\n")
}

function buildNoMoreFilesReport({ type, subject }) {
    return [
        "╭─〔 *FILE STATUS* 〕",
        "",
        "✅  Status: *Completed*",
        `📂  Type: *${type}*`,
        `📚  Subject: *${subject}*`,
        "",
        "Is subject ki aur files available nahi hain.",
        "Jo files thi woh send ho chuki hain.",
        "",
        "╰────────────────",
        buildSupportFooter()
    ].join("\n")
}

function buildMoreFilesNeedDetailsReport() {
    return [
        "╭─〔 *MORE FILES* 〕",
        "",
        "Command mein term aur subject bhi likho.",
        "",
        `Example: *${buildMoreFilesCommand("mid", "CS101")}*`,
        `Example: *${buildMoreFilesCommand("final", "CS101")}*`,
        "",
        "╰────────────────",
        buildSupportFooter()
    ].join("\n")
}

function buildHandoutsStatusReport({ subject }) {
    return [
        "╭─〔 *HANDOUTS STATUS* 〕",
        "",
        "⛔  Status: *Not Available*",
        `📘  Subject: *${subject}*`,
        "",
        "Handouts abhi Drive mein upload nahi hue.",
        "Jaldi add ho jaye ge, thora sabar karo.",
        "",
        "╰────────────────",
        buildSupportFooter()
    ].join("\n")
}

async function listDriveChildren(parentId, queryParts = []) {
    try {
        const q = [`'${parentId}' in parents`, "trashed = false", ...queryParts].join(" and ")
        const files = []
        let pageToken

        do {
            const res = await drive.files.list({
                q,
                pageSize: 1000,
                pageToken,
                fields: "nextPageToken, files(id, name, mimeType)"
            })

            files.push(...(res.data.files || []))
            pageToken = res.data.nextPageToken
        } while (pageToken)

        return files
    } catch (err) {
        console.log("Drive Error:", err?.message || err)
        return []
    }
}

async function findDriveFolderByName(parentId, folderNameKeywords) {
    const folders = await listDriveChildren(parentId, [`mimeType = '${DRIVE_FOLDER_MIME_TYPE}'`])
    const normalizedKeywords = folderNameKeywords.map(normalizeLookupText).filter(Boolean)

    return folders.find((folder) => {
        const normalizedName = normalizeLookupText(folder.name)
        return normalizedKeywords.some((keyword) => normalizedName.includes(keyword))
    }) || null
}

async function findTermSubjectFiles(termType, subject) {
    const termFolder = await findDriveFolderByName(DRIVE_FOLDER_ID, getTermFolderKeywords(termType))
    if (!termFolder?.id) return []

    const subjectFolder = await findDriveFolderByName(termFolder.id, [subject])
    if (!subjectFolder?.id) return []

    return listDriveChildren(subjectFolder.id, [`mimeType != '${DRIVE_FOLDER_MIME_TYPE}'`])
}

async function findHandouts(subject) {
    try {
        const files = await listDriveChildren(DRIVE_FOLDER_ID, [
            `mimeType != '${DRIVE_FOLDER_MIME_TYPE}'`,
            `name contains '${escapeDriveQueryValue(subject)}'`
        ])
        return files[0] || null
    } catch (err) {
        console.log("Drive Error:", err?.message || err)
        return null
    }
}

function buildMaterialReplyCard(type, subject, isAvailable) {
    const normalizedType = String(type || "files").toLowerCase()
    const title = normalizedType === "handouts" ? "HANDOUTS" : "FILES"
    const emoji = normalizedType === "handouts" ? "\u{1F4DA}" : "\u{1F4C1}"
    const subjectLabel = String(subject || "").toUpperCase()
    const statusLine = isAvailable
        ? `\u2705 ${normalizedType === "handouts" ? "Handouts have been sent successfully" : "Files have been sent successfully"}`
        : `\u{1F6AB} ${normalizedType === "handouts" ? "Handouts are not available right now" : "Files are not available right now"}`

    const lines = [
        "\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557",
        `${emoji} *${title}* ${subjectLabel}`,
        "\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D",
        "",
        statusLine
    ]

    if (!isAvailable) {
        lines.push("\u23F3 They'll be added very soon")
    }

    lines.push("")
    lines.push("\u2728 Stay connected!")

    return lines.join("\n")
}

async function handleFilesAndHandouts(sock, mek) {
    try {
        if (mek.key?.fromMe) return false

        const sender = mek.key?.remoteJid
        if (!sender) return false

        const text = (
            mek.message?.conversation ||
            mek.message?.extendedTextMessage?.text ||
            mek.message?.imageMessage?.caption ||
            mek.message?.videoMessage?.caption ||
            mek.message?.documentMessage?.caption ||
            ""
        ).trim()

        if (!text) return false

        const lowerText = text.toLowerCase()
        const textWithoutUrls = lowerText.replace(/https?:\/\/\S+/g, " ")
        const subjectCodes = getSubjectCodes(lowerText)
        const termType = detectTermType(lowerText)
        const wantsHandouts = /\b(handouts?|highlight(?:ed|s)?\s*handouts?|bookan|kitaaban|kitaban)\b/i.test(textWithoutUrls)
        const wantsMoreFiles = isMoreFilesRequest(lowerText)
        const wantsFiles = !wantsHandouts && (wantsMoreFiles || /\b(files?|send)\b/i.test(lowerText))
        const looksLikeBotAvailabilityReply =
            /^\s*[a-z]{2,4}\d{3}\s+ke handouts abhi available nahi hain\.?\s*$/i.test(text) ||
            /^\s*[a-z]{2,4}\d{3}\s+(mid term|final term)\s+material abhi available nahi hai\.?\s*$/i.test(text)

        if (looksLikeBotAvailabilityReply) return false

        const isFileRequest = subjectCodes.length > 0 && (wantsHandouts || (termType && wantsFiles))
        if (isFileRequest) {
            const requestKey = `${sender}::${lowerText}`
            const now = Date.now()
            const lastSeen = recentFileRequests.get(requestKey)
            if (lastSeen && (now - lastSeen) < 15000) {
                return true
            }
            recentFileRequests.set(requestKey, now)

            for (const [key, timestamp] of recentFileRequests.entries()) {
                if ((now - timestamp) > 60000) {
                    recentFileRequests.delete(key)
                }
            }
        }

        debugTermFiles("incomingTermRequestCheck", {
            text,
            termType,
            subjectCodes,
            wantsFiles,
            wantsHandouts,
            wantsMoreFiles
        })

        if (wantsMoreFiles && (!termType || subjectCodes.length === 0)) {
            await sock.sendMessage(sender, {
                text: buildMoreFilesNeedDetailsReport()
            }, { quoted: mek })
            return true
        }

        if (termType && subjectCodes.length > 0 && wantsFiles) {
            let totalSent = 0
            let foundAnyFile = false
            const unavailableSubjects = []
            const moreSubjects = []
            const reportType = `${termType === "mid" ? "Mid Term" : "Final Term"} Files`

            for (const subject of subjectCodes) {
                console.log("Searching term files:", termType, subject)
                const files = await findTermSubjectFiles(termType, subject)
                console.log("Term files result:", files)
                debugTermFiles("termRequestResult", {
                    sender,
                    termType,
                    subject,
                    fileCount: files.length
                })

                if (files.length > 0) {
                    const offsetKey = getTermFilesOffsetKey(sender, termType, subject)
                    const startIndex = wantsMoreFiles ? (termFileMoreOffsets.get(offsetKey) || 0) : 0
                    const filesToSend = files.slice(startIndex, startIndex + FILES_PER_SUBJECT_LIMIT)
                    const nextIndex = startIndex + filesToSend.length

                    if (filesToSend.length === 0) {
                        unavailableSubjects.push(subject)
                        termFileMoreOffsets.delete(offsetKey)
                        continue
                    }

                    foundAnyFile = true
                    if (nextIndex < files.length) {
                        termFileMoreOffsets.set(offsetKey, nextIndex)
                        moreSubjects.push(subject)
                    } else {
                        termFileMoreOffsets.delete(offsetKey)
                    }

                    for (const file of filesToSend) {
                        const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`
                        try {
                            await sock.sendMessage(sender, {
                                document: { url: downloadUrl },
                                mimetype: file.mimeType || "application/octet-stream",
                                fileName: file.name
                            }, { quoted: mek })
                            totalSent += 1
                            await wait(FILE_SEND_DELAY_MS)
                            debugTermFiles("sendFile:success", {
                                sender,
                                termType,
                                subject,
                                fileId: file.id,
                                fileName: file.name
                            })
                        } catch (sendErr) {
                            debugTermFiles("sendFile:error", {
                                sender,
                                termType,
                                subject,
                                fileId: file.id,
                                fileName: file.name,
                                error: sendErr?.message || sendErr
                            })
                            unavailableSubjects.push(subject)
                        }
                    }
                } else {
                    debugTermFiles("termRequest:notFound", {
                        sender,
                        termType,
                        subject
                    })
                    unavailableSubjects.push(subject)
                }
            }

            const subjectLabel = subjectCodes.join(", ")
            if (foundAnyFile && totalSent > 0) {
                await sock.sendMessage(sender, {
                    text: buildDeliveryReport({
                        type: reportType,
                        subject: subjectLabel,
                        totalSent,
                        moreSubjects,
                        termType
                    })
                }, { quoted: mek })
            } else {
                await sock.sendMessage(sender, {
                    text: wantsMoreFiles
                        ? buildNoMoreFilesReport({
                            type: reportType,
                            subject: unavailableSubjects.join(", ") || subjectLabel
                        })
                        : buildFileStatusReport({
                            type: reportType,
                            subject: unavailableSubjects.join(", ") || subjectLabel
                        })
                }, { quoted: mek })
            }
            return true
        }

        if (wantsHandouts && subjectCodes.length > 0) {
            let totalSent = 0
            let foundAnyFile = false
            const unavailableSubjects = []

            for (const subject of subjectCodes) {
                console.log("Searching handout:", subject)
                const file = await findHandouts(subject)
                console.log("Result:", file)

                if (file?.id) {
                    foundAnyFile = true
                    const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`
                    await sock.sendMessage(sender, {
                        document: { url: downloadUrl },
                        mimetype: file.mimeType || "application/octet-stream",
                        fileName: file.name
                    }, { quoted: mek })
                    totalSent += 1
                    await wait(FILE_SEND_DELAY_MS)
                } else {
                    unavailableSubjects.push(subject)
                }
            }

            const subjectLabel = subjectCodes.join(", ")
            if (foundAnyFile && totalSent > 0) {
                await sock.sendMessage(sender, {
                    text: buildHandoutsReport({
                        subject: subjectLabel,
                        totalSent
                    })
                }, { quoted: mek })
            } else {
                await sock.sendMessage(sender, {
                    text: buildHandoutsStatusReport({
                        subject: unavailableSubjects.join(", ") || subjectLabel
                    })
                }, { quoted: mek })
            }
            return true
        }

        return false
    } catch (err) {
        console.log("File Request Error:", err?.message || err)
        if (mek.key?.remoteJid) {
            await sock.sendMessage(mek.key.remoteJid, {
                text: "⚠️ Oops! Something went wrong while fetching your files. Please try again later."
            }, { quoted: mek }).catch(() => {})
        }
        return true
    }
}

async function showQrImage(qrText) {
    const outputPath = path.join(__dirname, "whatsapp-qr.png")
    await QRCode.toFile(outputPath, qrText, {
        margin: 2,
        scale: 10
    })
    console.log(chalk.green(`QR saved: ${outputPath}`))
    if (process.platform === "win32") {
        exec(`start "" "${outputPath}"`)
    }
}

// Memory optimization - Force garbage collection if available
setInterval(() => {
if (global.gc) {
        global.gc()
        console.log('🧹 Garbage collection completed')
    }
}, 60_000) // every 1 minute

// Memory monitoring - Restart if RAM gets too high
setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024
    if (used > 400) {
        console.log('⚠️ RAM too high (>400MB), restarting bot...')
        process.exit(1) // Panel will auto-restart
    }
}, 30_000) // check every 30 seconds

let phoneNumber = "911234567890"
let owner = JSON.parse(fs.readFileSync('./data/owner.json'))

global.botname = "Prince 2.0"
const pairingCode = false
const useMobile = false
global.themeemoji = "•"

// Only create readline interface if we're in an interactive environment
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => {
    if (rl) {
        return new Promise((resolve) => rl.question(text, resolve))
    } else {
        // In non-interactive environment, use ownerNumber from settings
        return Promise.resolve(settings.ownerNumber || phoneNumber)
    }
}


async function startXeonBotInc() {
    if (isStarting) return
    isStarting = true
    try {
        let { version, isLatest } = await fetchLatestBaileysVersion()
        const { state, saveCreds } = await useMultiFileAuthState(`./session`)
        const msgRetryCounterCache = new NodeCache()

        const XeonBotInc = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            getMessage: async (key) => {
                let jid = jidNormalizedUser(key.remoteJid)
                let msg = await store.loadMessage(jid, key.id)
                return msg?.message || ""
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        })
        currentSocket = XeonBotInc
        enableSmallCapsMessages(XeonBotInc)
        ensureScheduleRunner()

        // Save credentials when they update
        XeonBotInc.ev.on('creds.update', saveCreds)

    store.bind(XeonBotInc.ev)

    // Message handling
    XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await handleStatus(XeonBotInc, chatUpdate);
                return;
            }
            // In private mode, only block non-group messages (allow groups for moderation)
            // Note: XeonBotInc.public is not synced, so we check mode in main.js instead
            // This check is kept for backward compatibility but mainly blocks DMs
            if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') {
                const isGroup = mek.key?.remoteJid?.endsWith('@g.us')
                if (!isGroup) return // Block DMs in private mode, but allow group messages
            }
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

            // Clear message retry cache to prevent memory bloat
            if (XeonBotInc?.msgRetryCounterCache) {
                XeonBotInc.msgRetryCounterCache.clear()
            }

            const filesHandled = await handleFilesAndHandouts(XeonBotInc, mek)
            if (filesHandled) return

            try {
                await handleMessages(XeonBotInc, chatUpdate, true)
            } catch (err) {
                console.error("Error in handleMessages:", err)
                // Only try to send error message if we have a valid chatId
                if (mek.key && mek.key.remoteJid) {
                    await XeonBotInc.sendMessage(mek.key.remoteJid, {
                        text: '❌ An error occurred while processing your message.'
                    }).catch(console.error);
                }
            }
        } catch (err) {
            console.error("Error in messages.upsert:", err)
        }
    })

    // Add these event handlers for better functionality
    XeonBotInc.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    XeonBotInc.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = XeonBotInc.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    XeonBotInc.getName = (jid, withoutContact = false) => {
        id = XeonBotInc.decodeJid(jid)
        withoutContact = XeonBotInc.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = XeonBotInc.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === XeonBotInc.decodeJid(XeonBotInc.user.id) ?
            XeonBotInc.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    XeonBotInc.public = true

    XeonBotInc.serializeM = (m) => smsg(XeonBotInc, m, store)

    // Handle pairing code
    if (pairingCode && !XeonBotInc.authState.creds.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile api')

        let phoneNumber
        if (!!global.phoneNumber) {
            phoneNumber = global.phoneNumber
        } else {
            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFormat: 6281376552730 (without + or spaces) : `)))
        }

        // Clean the phone number - remove any non-digit characters
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

        // Validate the phone number using awesome-phonenumber
        const pn = require('awesome-phonenumber');
        if (!pn('+' + phoneNumber).isValid()) {
            console.log(chalk.red('Invalid phone number. Please enter your full international number (e.g., 15551234567 for US, 447911123456 for UK, etc.) without + or spaces.'));
            process.exit(1);
        }

        setTimeout(async () => {
            try {
                let code = await XeonBotInc.requestPairingCode(phoneNumber)
                code = code?.match(/.{1,4}/g)?.join("-") || code
                console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
                console.log(chalk.yellow(`\nPlease enter this code in your WhatsApp app:\n1. Open WhatsApp\n2. Go to Settings > Linked Devices\n3. Tap "Link a Device"\n4. Enter the code shown above`))
            } catch (error) {
                console.error('Error requesting pairing code:', error)
                console.log(chalk.red('Failed to get pairing code. Please check your phone number and try again.'))
            }
        }, 3000)
    }

    // Connection handling
    XeonBotInc.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect, qr } = s
        
        if (qr) {
            qrcodeTerminal.generate(qr, { small: true })
            await showQrImage(qr)
            console.log(chalk.yellow('📱 QR Code generated. Please scan with WhatsApp.'))
        }
        
        if (connection === 'connecting') {
            console.log(chalk.yellow('🔄 Connecting to WhatsApp...'))
        }
        
        if (connection == "open") {
            console.log(chalk.magenta(` `))
            console.log(chalk.yellow(`🌿 Connected to => ` + JSON.stringify(XeonBotInc.user, null, 2)))

            try {
                const botNumber = XeonBotInc.user.id.split(':')[0] + '@s.whatsapp.net';
                await XeonBotInc.sendMessage(botNumber, {
                    text: `Bot Connected Successfully!

Time: 
Status: Online and Ready!`
                });
            } catch (error) {
                console.error('Error sending connection message:', error.message)
            }

            await delay(1999)
            console.log(chalk.yellow(`\n\n                  ${chalk.bold.blue(`[ ${global.botname || 'Prince 2.0'} ]`)}\n\n`))
            console.log(chalk.cyan(`< ================================================== >`))
            console.log(chalk.magenta(`\n${global.themeemoji || '•'} YT CHANNEL: null`))
            console.log(chalk.magenta(`${global.themeemoji || '•'} GITHUB: null`))
            console.log(chalk.magenta(`${global.themeemoji || '•'} WA NUMBER: ${owner}`))
            console.log(chalk.magenta(`${global.themeemoji || '•'} CREDIT: Abdul`))
            console.log(chalk.green(`${global.themeemoji || '•'} 🤖 Bot Connected Successfully! ✅`))
            console.log(chalk.blue(`Bot Version: ${settings.version}`))
        }
        
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode
            const errorText = String(lastDisconnect?.error || '')
            const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401
            const isConflict = /conflict/i.test(errorText)
            const isQrExpired = /qr refs attempts ended/i.test(errorText)
            const isRestartRequired = /restart required/i.test(errorText) || statusCode === DisconnectReason.restartRequired
            const shouldReconnect = !isLoggedOut && !isConflict && !isQrExpired
            
            console.log(chalk.red(`Connection closed due to ${lastDisconnect?.error}, reconnecting ${shouldReconnect}`))
            if (currentSocket !== XeonBotInc) return
            
            if (isLoggedOut) {
                try {
                    rmSync('./session', { recursive: true, force: true })
                    console.log(chalk.yellow('Session folder deleted. Please re-authenticate.'))
                } catch (error) {
                    console.error('Error deleting session:', error)
                }
                console.log(chalk.red('Session logged out. Please re-authenticate.'))
            }

            if (isConflict) {
                console.log(chalk.red('Connection conflict detected. Another bot instance may already be running. Auto-reconnect stopped.'))
                return
            }

            if (isQrExpired) {
                console.log(chalk.red('QR attempts expired. Auto-reconnect stopped until you start the bot again.'))
                return
            }

            if (shouldReconnect || isRestartRequired) {
                scheduleReconnect(isRestartRequired ? 'restart required' : errorText)
            }
        }
    })

    // Track recently-notified callers to avoid spamming messages
    const antiCallNotified = new Set();

    // Anticall handler: block callers when enabled
    XeonBotInc.ev.on('call', async (calls) => {
        try {
            const { readState: readAnticallState } = require('./commands/anticall');
            const state = readAnticallState();
            if (!state.enabled) return;
            for (const call of calls) {
                const callerJid = call.from || call.peerJid || call.chatId;
                if (!callerJid) continue;
                try {
                    // First: attempt to reject the call if supported
                    try {
                        if (typeof XeonBotInc.rejectCall === 'function' && call.id) {
                            await XeonBotInc.rejectCall(call.id, callerJid);
                        } else if (typeof XeonBotInc.sendCallOfferAck === 'function' && call.id) {
                            await XeonBotInc.sendCallOfferAck(call.id, callerJid, 'reject');
                        }
                    } catch {}

                    // Notify the caller only once within a short window
                    if (!antiCallNotified.has(callerJid)) {
                        antiCallNotified.add(callerJid);
                        setTimeout(() => antiCallNotified.delete(callerJid), 60000);
                        await XeonBotInc.sendMessage(callerJid, { text: '📵 Anticall is enabled. Your call was rejected and you will be blocked.' });
                    }
                } catch {}
                // Then: block after a short delay to ensure rejection and message are processed
                setTimeout(async () => {
                    try { await XeonBotInc.updateBlockStatus(callerJid, 'block'); } catch {}
                }, 800);
            }
        } catch (e) {
            // ignore
        }
    });

    XeonBotInc.ev.on('group-participants.update', async (update) => {
        await handleGroupParticipantUpdate(XeonBotInc, update);
    });

    XeonBotInc.ev.on('messages.upsert', async (m) => {
        if (m.messages[0].key && m.messages[0].key.remoteJid === 'status@broadcast') {
            await handleStatus(XeonBotInc, m);
        }
    });

    XeonBotInc.ev.on('status.update', async (status) => {
        await handleStatus(XeonBotInc, status);
    });

    XeonBotInc.ev.on('messages.reaction', async (status) => {
        await handleStatus(XeonBotInc, status);
    });

    return XeonBotInc
    } catch (error) {
        console.error('Error in startXeonBotInc:', error)
        scheduleReconnect(error?.message || 'startup error')
    } finally {
        isStarting = false
    }
}


// Start the bot with error handling
startXeonBotInc().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
})

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})



