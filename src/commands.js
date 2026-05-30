'use strict';

const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs-extra');
const config = require('./config');
const scheduler = require('./scheduler');
const logger = require('./logger');

const prefix = config.commandPrefix;

function isAdmin(msg) {
    const from = msg.from.replace('@c.us', '').replace('@s.whatsapp.net', '');
    return config.adminNumbers.includes(from) || config.ownerNumber === from;
}

async function handle(client, msg) {
    const body = msg.body ? msg.body.trim() : '';

    // ─── ADMIN COMMANDS ───────────────────────────────────────────────────────
    if (body.startsWith(prefix) && isAdmin(msg)) {
        const args = body.slice(prefix.length).trim().split(/\s+/);
        const cmd = args[0].toLowerCase();
        const rest = args.slice(1).join(' ');

        switch (cmd) {
            case 'blast': {
                // !blast <message>  – immediately blast to all/configured groups
                if (!rest) {
                    await msg.reply('Usage: !blast <your message>');
                    return;
                }
                const chats = await client.getChats();
                const groups = chats.filter(c => {
                    if (!c.isGroup) return false;
                    if (!config.groupBroadcast.targetGroups.length) return true;
                    return config.groupBroadcast.targetGroups.some(n =>
                        c.name.toLowerCase().includes(n.toLowerCase())
                    );
                });
                await msg.reply(`Blasting to ${groups.length} group(s)…`);
                for (const g of groups) {
                    try { await g.sendMessage(rest); } catch (e) { /* skip */ }
                    await delay(config.groupBroadcast.delayMs);
                }
                await msg.reply(`Done! Message sent to ${groups.length} group(s).`);
                logger.log(`Manual blast by admin: "${rest.slice(0, 60)}"`);
                break;
            }

            case 'dm': {
                // !dm <number> <message>
                const [num, ...msgParts] = rest.split(' ');
                if (!num || !msgParts.length) {
                    await msg.reply('Usage: !dm <number> <message>\nExample: !dm 2348012345678 Hello!');
                    return;
                }
                const chatId = `${num}@c.us`;
                await client.sendMessage(chatId, msgParts.join(' '));
                await msg.reply(`DM sent to ${num}`);
                logger.log(`Admin DM to ${num}`);
                break;
            }

            case 'status': {
                // !status <message>  – update your WhatsApp status now
                if (!rest) {
                    await msg.reply('Usage: !status <text>');
                    return;
                }
                await client.setStatus(rest);
                await msg.reply('Status updated!');
                logger.log(`Status updated via command: "${rest.slice(0, 60)}"`);
                break;
            }

            case 'statusnow': {
                // !statusnow  – trigger the scheduled status update immediately
                await scheduler.postStatus();
                await msg.reply('Status updated with next scheduled message!');
                break;
            }

            case 'blastnow': {
                // !blastnow  – trigger scheduled group broadcast immediately
                await msg.reply('Running group broadcast now…');
                await scheduler.groupBroadcast();
                await msg.reply('Group broadcast complete!');
                break;
            }

            case 'dmnow': {
                // !dmnow  – trigger DM campaign immediately
                await msg.reply('Running DM campaign now…');
                await scheduler.dmCampaign();
                await msg.reply('DM campaign complete!');
                break;
            }

            case 'groups': {
                // !groups  – list all groups the bot is in
                const chats = await client.getChats();
                const groups = chats.filter(c => c.isGroup);
                const list = groups.map((g, i) => `${i + 1}. ${g.name}`).join('\n');
                await msg.reply(`*Groups (${groups.length}):*\n${list || 'None'}`);
                break;
            }

            case 'contacts': {
                // !contacts  – count contacts
                const contacts = await client.getContacts();
                const personal = contacts.filter(c => c.isMyContact && !c.isGroup);
                await msg.reply(`You have ${personal.length} saved contacts.`);
                break;
            }

            case 'help': {
                await msg.reply(
                    `*WhatsApp Marketing Bot – Admin Commands*\n\n` +
                    `${prefix}blast <msg>        – Blast message to all groups\n` +
                    `${prefix}blastnow            – Run scheduled broadcast now\n` +
                    `${prefix}dm <num> <msg>      – Send a DM to a number\n` +
                    `${prefix}dmnow               – Run DM campaign now\n` +
                    `${prefix}status <text>       – Update your status text\n` +
                    `${prefix}statusnow           – Post next scheduled status\n` +
                    `${prefix}groups              – List groups bot is in\n` +
                    `${prefix}contacts            – Count your contacts\n` +
                    `${prefix}help                – Show this help`
                );
                break;
            }

            default:
                // Unknown admin command – fall through to auto-reply
                break;
        }
        return;
    }

    // ─── AUTO-REPLY ───────────────────────────────────────────────────────────
    if (!config.autoReply.enabled) return;
    if (config.autoReply.dmOnly && msg.from.endsWith('@g.us')) return;
    if (msg.fromMe) return;

    const lower = body.toLowerCase();
    for (const rule of config.autoReply.rules) {
        if (lower.includes(rule.keyword.toLowerCase())) {
            await msg.reply(rule.reply);
            logger.log(`Auto-reply triggered: keyword="${rule.keyword}" to ${msg.from}`);
            break;
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { handle };
