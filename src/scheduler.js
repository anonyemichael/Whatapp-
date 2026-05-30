'use strict';

const cron = require('node-cron');
const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs-extra');
const config = require('./config');
const logger = require('./logger');

let _client = null;
let _statusIndex = 0;
let _groupMsgIndex = 0;
let _dmMsgIndex = 0;

function pickNext(arr, indexRef) {
    const val = arr[indexRef.value % arr.length];
    indexRef.value++;
    return val;
}

// ─── STATUS UPDATE ────────────────────────────────────────────────────────────
async function postStatus() {
    const cfg = config.statusUpdate;
    if (!cfg.enabled || !cfg.messages.length) return;

    const ref = { value: _statusIndex };
    const text = pickNext(cfg.messages, ref);
    _statusIndex = ref.value;

    try {
        if (cfg.imagePath && fs.existsSync(cfg.imagePath)) {
            const media = MessageMedia.fromFilePath(cfg.imagePath);
            await _client.setStatus(text);
            // whatsapp-web.js posts status via the dedicated API
            await _client.pupPage.evaluate(async (caption) => {
                // Fallback: plain text status
            }, text);
        }
        await _client.setStatus(text);
        logger.log(`Status updated: ${text.slice(0, 60)}...`);
    } catch (err) {
        logger.error('postStatus', err);
    }
}

// ─── GROUP BROADCAST ─────────────────────────────────────────────────────────
async function groupBroadcast() {
    const cfg = config.groupBroadcast;
    if (!cfg.enabled || !cfg.messages.length) return;

    const ref = { value: _groupMsgIndex };
    const text = pickNext(cfg.messages, ref);
    _groupMsgIndex = ref.value;

    let media = null;
    if (cfg.imagePath && fs.existsSync(cfg.imagePath)) {
        media = MessageMedia.fromFilePath(cfg.imagePath);
    }

    try {
        const chats = await _client.getChats();
        const groups = chats.filter(c => {
            if (!c.isGroup) return false;
            if (!cfg.targetGroups.length) return true;
            return cfg.targetGroups.some(name =>
                c.name.toLowerCase().includes(name.toLowerCase())
            );
        });

        logger.log(`Group broadcast: targeting ${groups.length} group(s)`);

        for (const group of groups) {
            try {
                if (media) {
                    await group.sendMessage(media, { caption: text });
                } else {
                    await group.sendMessage(text);
                }
                logger.log(`  → Sent to: ${group.name}`);
            } catch (e) {
                logger.error(`  → Failed for ${group.name}`, e);
            }
            await delay(cfg.delayMs);
        }
    } catch (err) {
        logger.error('groupBroadcast', err);
    }
}

// ─── DM CAMPAIGN ─────────────────────────────────────────────────────────────
async function dmCampaign() {
    const cfg = config.dmCampaign;
    if (!cfg.enabled || !cfg.contacts.length || !cfg.messages.length) return;

    const ref = { value: _dmMsgIndex };
    const template = pickNext(cfg.messages, ref);
    _dmMsgIndex = ref.value;

    logger.log(`DM campaign: sending to ${cfg.contacts.length} contact(s)`);

    for (const number of cfg.contacts) {
        try {
            const chatId = `${number}@c.us`;
            const contact = await _client.getContactById(chatId).catch(() => null);
            const name = contact?.pushname || contact?.name || number;
            const text = template.replace('{name}', name);
            await _client.sendMessage(chatId, text);
            logger.log(`  → DM sent to ${number}`);
        } catch (e) {
            logger.error(`  → DM failed for ${number}`, e);
        }
        await delay(cfg.delayMs);
    }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init(client) {
    _client = client;

    if (config.statusUpdate.enabled) {
        cron.schedule(config.statusUpdate.schedule, postStatus);
        console.log(`  [Scheduler] Status updates: ${config.statusUpdate.schedule}`);
    }

    if (config.groupBroadcast.enabled) {
        cron.schedule(config.groupBroadcast.schedule, groupBroadcast);
        console.log(`  [Scheduler] Group broadcast: ${config.groupBroadcast.schedule}`);
    }

    if (config.dmCampaign.enabled) {
        cron.schedule(config.dmCampaign.schedule, dmCampaign);
        console.log(`  [Scheduler] DM campaign: ${config.dmCampaign.schedule}`);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { init, postStatus, groupBroadcast, dmCampaign };
