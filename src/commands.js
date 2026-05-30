'use strict';

const fs = require('fs-extra');
const mime = require('mime-types');
const config = require('./config');
const scheduler = require('./scheduler');
const logger = require('./logger');

const prefix = config.commandPrefix;

function getSender(msg) {
    return (msg.key.participant || msg.key.remoteJid || '').split('@')[0];
}

function isAdmin(msg) {
    const sender = getSender(msg);
    return config.adminNumbers.includes(sender) || config.ownerNumber === sender;
}

function getBody(msg) {
    return (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        ''
    ).trim();
}

function isGroup(msg) {
    return msg.key.remoteJid?.endsWith('@g.us');
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function sendReply(sock, msg, text) {
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
}

async function handle(sock, msg) {
    if (msg.key.fromMe) return;

    const body = getBody(msg);
    if (!body) return;

    // ─── ADMIN COMMANDS ───────────────────────────────────────────────────────
    if (body.startsWith(prefix) && isAdmin(msg)) {
        const args = body.slice(prefix.length).trim().split(/\s+/);
        const cmd = args[0].toLowerCase();
        const rest = args.slice(1).join(' ');

        switch (cmd) {
            case 'blast': {
                if (!rest) { await sendReply(sock, msg, 'Usage: !blast <message>'); return; }
                const groups = await getGroups(sock);
                await sendReply(sock, msg, `Blasting to ${groups.length} group(s)…`);
                for (const jid of groups) {
                    try { await sock.sendMessage(jid, { text: rest }); } catch (e) { /* skip */ }
                    await delay(config.groupBroadcast.delayMs);
                }
                await sendReply(sock, msg, `Done! Sent to ${groups.length} group(s).`);
                logger.log(`Manual blast: "${rest.slice(0, 60)}"`);
                break;
            }

            case 'dm': {
                const [num, ...parts] = rest.split(' ');
                if (!num || !parts.length) {
                    await sendReply(sock, msg, 'Usage: !dm <number> <message>\nExample: !dm 233201234567 Hello!');
                    return;
                }
                await sock.sendMessage(`${num}@s.whatsapp.net`, { text: parts.join(' ') });
                await sendReply(sock, msg, `DM sent to ${num}`);
                logger.log(`Admin DM to ${num}`);
                break;
            }

            case 'status': {
                if (!rest) { await sendReply(sock, msg, 'Usage: !status <text>'); return; }
                await sock.updateProfileStatus(rest);
                await sendReply(sock, msg, 'Status updated!');
                logger.log(`Status updated: "${rest.slice(0, 60)}"`);
                break;
            }

            case 'statusnow': {
                await scheduler.postStatus();
                await sendReply(sock, msg, 'Scheduled status posted!');
                break;
            }

            case 'blastnow': {
                await sendReply(sock, msg, 'Running group broadcast…');
                await scheduler.groupBroadcast();
                await sendReply(sock, msg, 'Group broadcast complete!');
                break;
            }

            case 'dmnow': {
                await sendReply(sock, msg, 'Running DM campaign…');
                await scheduler.dmCampaign();
                await sendReply(sock, msg, 'DM campaign complete!');
                break;
            }

            case 'video': {
                // !video <path> [caption]  – blast a video to all groups immediately
                const spaceIdx = rest.indexOf(' ');
                const filePath = spaceIdx > -1 ? rest.slice(0, spaceIdx) : rest;
                const caption  = spaceIdx > -1 ? rest.slice(spaceIdx + 1) : '';
                if (!filePath) {
                    await sendReply(sock, msg, 'Usage: !video <file_path> [caption]\nExample: !video ./media/promo.mp4 Check this out!');
                    return;
                }
                if (!fs.existsSync(filePath)) {
                    await sendReply(sock, msg, `File not found: ${filePath}`);
                    return;
                }
                const videoData = fs.readFileSync(filePath);
                const mimeType = mime.lookup(filePath) || 'video/mp4';
                const groups = await getGroups(sock);
                await sendReply(sock, msg, `Sending video to ${groups.length} group(s)…`);
                for (const jid of groups) {
                    try {
                        await sock.sendMessage(jid, { video: videoData, caption, mimetype: mimeType, gifPlayback: false });
                    } catch (e) { /* skip */ }
                    await delay(config.groupBroadcast.delayMs);
                }
                await sendReply(sock, msg, `Video sent to ${groups.length} group(s)!`);
                logger.log(`Video blast: ${filePath}`);
                break;
            }

            case 'statusvideo': {
                // !statusvideo <path> [caption]  – post a video as your WhatsApp status
                const spaceIdx2 = rest.indexOf(' ');
                const vPath   = spaceIdx2 > -1 ? rest.slice(0, spaceIdx2) : rest;
                const vCaption = spaceIdx2 > -1 ? rest.slice(spaceIdx2 + 1) : '';
                if (!vPath) {
                    await sendReply(sock, msg, 'Usage: !statusvideo <file_path> [caption]\nExample: !statusvideo ./media/promo.mp4 Hot deals today!');
                    return;
                }
                if (!fs.existsSync(vPath)) {
                    await sendReply(sock, msg, `File not found: ${vPath}`);
                    return;
                }
                const vData = fs.readFileSync(vPath);
                const vMime = mime.lookup(vPath) || 'video/mp4';
                await sock.sendMessage('status@broadcast', {
                    video: vData,
                    caption: vCaption,
                    mimetype: vMime,
                    gifPlayback: false,
                }, { statusJidList: [] });
                await sendReply(sock, msg, 'Video posted as your WhatsApp status!');
                logger.log(`Video status posted: ${vPath}`);
                break;
            }

            case 'statusimage': {
                // !statusimage <path> [caption]  – post an image as your WhatsApp status
                const spaceIdx3 = rest.indexOf(' ');
                const iPath    = spaceIdx3 > -1 ? rest.slice(0, spaceIdx3) : rest;
                const iCaption = spaceIdx3 > -1 ? rest.slice(spaceIdx3 + 1) : '';
                if (!iPath) {
                    await sendReply(sock, msg, 'Usage: !statusimage <file_path> [caption]');
                    return;
                }
                if (!fs.existsSync(iPath)) {
                    await sendReply(sock, msg, `File not found: ${iPath}`);
                    return;
                }
                const iData = fs.readFileSync(iPath);
                const iMime = mime.lookup(iPath) || 'image/jpeg';
                await sock.sendMessage('status@broadcast', {
                    image: iData,
                    caption: iCaption,
                    mimetype: iMime,
                }, { statusJidList: [] });
                await sendReply(sock, msg, 'Image posted as your WhatsApp status!');
                logger.log(`Image status posted: ${iPath}`);
                break;
            }

            case 'groups': {
                const groups = await sock.groupFetchAllParticipating();
                const list = Object.values(groups).map((g, i) => `${i + 1}. ${g.subject}`).join('\n');
                await sendReply(sock, msg, `*Groups (${Object.keys(groups).length}):*\n${list || 'None'}`);
                break;
            }

            case 'help': {
                await sendReply(sock, msg,
                    `*WhatsApp Marketing Bot – Commands*\n\n` +
                    `📢 *Broadcasts*\n` +
                    `${prefix}blast <msg>              – Text blast to all groups\n` +
                    `${prefix}blastnow                 – Run scheduled broadcast now\n` +
                    `${prefix}video <path> [caption]   – Video blast to all groups\n\n` +
                    `📱 *Status / Story*\n` +
                    `${prefix}status <text>            – Update status text now\n` +
                    `${prefix}statusnow                – Post next scheduled status\n` +
                    `${prefix}statusvideo <path> [cap] – Post video as status\n` +
                    `${prefix}statusimage <path> [cap] – Post image as status\n\n` +
                    `💬 *Direct Messages*\n` +
                    `${prefix}dm <num> <msg>           – DM any number\n` +
                    `${prefix}dmnow                    – Run DM campaign now\n\n` +
                    `🔧 *Other*\n` +
                    `${prefix}groups                   – List all groups\n` +
                    `${prefix}help                     – Show this help`
                );
                break;
            }

            default: break;
        }
        return;
    }

    // ─── AUTO-REPLY ───────────────────────────────────────────────────────────
    if (!config.autoReply.enabled) return;
    if (config.autoReply.dmOnly && isGroup(msg)) return;

    const lower = body.toLowerCase();
    for (const rule of config.autoReply.rules) {
        if (lower.includes(rule.keyword.toLowerCase())) {
            await sendReply(sock, msg, rule.reply);
            logger.log(`Auto-reply: keyword="${rule.keyword}" to ${getSender(msg)}`);
            break;
        }
    }
}

async function getGroups(sock) {
    const cfg = config.groupBroadcast;
    const groups = await sock.groupFetchAllParticipating();
    const jids = Object.keys(groups);
    if (!cfg.targetGroups.length) return jids;
    return jids.filter(jid => {
        const name = groups[jid].subject || '';
        return cfg.targetGroups.some(t => name.toLowerCase().includes(t.toLowerCase()));
    });
}

module.exports = { handle };
