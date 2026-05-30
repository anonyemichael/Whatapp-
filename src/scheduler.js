'use strict';

const cron = require('node-cron');
const fs = require('fs-extra');
const config = require('./config');
const logger = require('./logger');

let _sock = null;
let _statusIndex = 0;
let _groupMsgIndex = 0;
let _dmMsgIndex = 0;

function pickNext(arr, ref) {
    const val = arr[ref.value % arr.length];
    ref.value++;
    return val;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── STATUS UPDATE ────────────────────────────────────────────────────────────
async function postStatus() {
    const cfg = config.statusUpdate;
    if (!cfg.enabled || !cfg.messages.length) return;
    const ref = { value: _statusIndex };
    const text = pickNext(cfg.messages, ref);
    _statusIndex = ref.value;
    try {
        await _sock.updateProfileStatus(text);
        logger.log(`Status updated: ${text.slice(0, 60)}`);
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

    try {
        const groups = await getTargetGroups(cfg.targetGroups);
        logger.log(`Group broadcast: targeting ${groups.length} group(s)`);

        for (const jid of groups) {
            try {
                const payload = { text };
                if (cfg.imagePath && fs.existsSync(cfg.imagePath)) {
                    const image = fs.readFileSync(cfg.imagePath);
                    await _sock.sendMessage(jid, { image, caption: text });
                } else {
                    await _sock.sendMessage(jid, payload);
                }
                logger.log(`  → Sent to group ${jid}`);
            } catch (e) {
                logger.error(`  → Failed for ${jid}`, e);
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
        const jid = `${number}@s.whatsapp.net`;
        const text = template.replace('{name}', `+${number}`);
        try {
            await _sock.sendMessage(jid, { text });
            logger.log(`  → DM sent to ${number}`);
        } catch (e) {
            logger.error(`  → DM failed for ${number}`, e);
        }
        await delay(cfg.delayMs);
    }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
async function getTargetGroups(targetNames) {
    const groups = await _sock.groupFetchAllParticipating();
    const jids = Object.keys(groups);
    if (!targetNames.length) return jids;
    return jids.filter(jid => {
        const name = groups[jid].subject || '';
        return targetNames.some(t => name.toLowerCase().includes(t.toLowerCase()));
    });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init(sock) {
    _sock = sock;
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

module.exports = { init, postStatus, groupBroadcast, dmCampaign };
