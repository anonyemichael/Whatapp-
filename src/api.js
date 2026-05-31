'use strict';

const express = require('express');
const fs = require('fs-extra');
const mime = require('mime-types');
const config = require('./config');
const scheduler = require('./scheduler');
const logger = require('./logger');
const { createMcpRouter } = require('../mcp/server');

const app = express();
app.use(express.json());

let _sock = null;

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function getGroups(targetNames = []) {
    const all = await _sock.groupFetchAllParticipating();
    const jids = Object.keys(all);
    if (!targetNames.length) return jids.map(jid => ({ jid, name: all[jid].subject }));
    return jids
        .filter(jid => targetNames.some(t => (all[jid].subject || '').toLowerCase().includes(t.toLowerCase())))
        .map(jid => ({ jid, name: all[jid].subject }));
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', bot: !!_sock, time: new Date().toISOString() });
});

// ─── LIST GROUPS ──────────────────────────────────────────────────────────────
app.get('/groups', async (req, res) => {
    try {
        const groups = await getGroups();
        res.json({ groups, count: groups.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── BLAST TEXT TO GROUPS ─────────────────────────────────────────────────────
app.post('/blast', async (req, res) => {
    const { message, targetGroups = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    try {
        const groups = await getGroups(targetGroups);
        const results = [];
        for (const { jid, name } of groups) {
            try {
                await _sock.sendMessage(jid, { text: message });
                results.push({ name, status: 'sent' });
            } catch (e) {
                results.push({ name, status: 'failed', error: e.message });
            }
            await delay(config.groupBroadcast.delayMs);
        }
        logger.log(`API blast: "${message.slice(0, 50)}" → ${groups.length} groups`);
        res.json({ sent: results.filter(r => r.status === 'sent').length, total: groups.length, results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── SEND DM ──────────────────────────────────────────────────────────────────
app.post('/dm', async (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) return res.status(400).json({ error: 'number and message are required' });

    try {
        const jid = `${number}@s.whatsapp.net`;
        await _sock.sendMessage(jid, { text: message });
        logger.log(`API DM to ${number}: "${message.slice(0, 50)}"`);
        res.json({ success: true, number });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── UPDATE STATUS TEXT ───────────────────────────────────────────────────────
app.post('/status/text', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    try {
        await _sock.sendMessage('status@broadcast', { text }, { statusJidList: [] });
        logger.log(`API status text: "${text.slice(0, 60)}"`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST VIDEO STATUS ────────────────────────────────────────────────────────
app.post('/status/video', async (req, res) => {
    const { filePath, caption = '' } = req.body;
    if (!filePath) return res.status(400).json({ error: 'filePath is required' });
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found: ' + filePath });

    try {
        const video = fs.readFileSync(filePath);
        const mimetype = mime.lookup(filePath) || 'video/mp4';
        await _sock.sendMessage('status@broadcast', { video, caption, mimetype, gifPlayback: false }, { statusJidList: [] });
        logger.log(`API video status: ${filePath}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST IMAGE STATUS ────────────────────────────────────────────────────────
app.post('/status/image', async (req, res) => {
    const { filePath, caption = '' } = req.body;
    if (!filePath) return res.status(400).json({ error: 'filePath is required' });
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found: ' + filePath });

    try {
        const image = fs.readFileSync(filePath);
        const mimetype = mime.lookup(filePath) || 'image/jpeg';
        await _sock.sendMessage('status@broadcast', { image, caption, mimetype }, { statusJidList: [] });
        logger.log(`API image status: ${filePath}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── TRIGGER SCHEDULED JOBS NOW ───────────────────────────────────────────────
app.post('/run/status', async (req, res) => {
    try {
        await scheduler.postStatus();
        res.json({ success: true, action: 'status posted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/run/broadcast', async (req, res) => {
    try {
        await scheduler.groupBroadcast();
        res.json({ success: true, action: 'group broadcast done' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/run/campaign', async (req, res) => {
    try {
        await scheduler.dmCampaign();
        res.json({ success: true, action: 'DM campaign done' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── ADD KEYWORD RULE ─────────────────────────────────────────────────────────
app.post('/autoreply/add', (req, res) => {
    const { keyword, reply } = req.body;
    if (!keyword || !reply) return res.status(400).json({ error: 'keyword and reply are required' });

    const exists = config.autoReply.rules.some(r => r.keyword.toLowerCase() === keyword.toLowerCase());
    if (exists) return res.status(409).json({ error: `Keyword "${keyword}" already exists` });

    config.autoReply.rules.push({ keyword, reply });
    logger.log(`API: added auto-reply keyword "${keyword}"`);
    res.json({ success: true, keyword, reply });
});

// ─── LIST AUTO-REPLY RULES ────────────────────────────────────────────────────
app.get('/autoreply', (req, res) => {
    res.json({ rules: config.autoReply.rules.map(r => ({ keyword: r.keyword })) });
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init(sock, port = 3000) {
    _sock = sock;

    // Mount MCP server at /mcp
    app.use('/mcp', createMcpRouter(express));

    app.listen(port, () => {
        console.log(`  [API] Bot REST API  → http://localhost:${port}`);
        console.log(`  [API] MCP endpoint  → http://localhost:${port}/mcp`);
        console.log(`  [API] Expose with:    cloudflared tunnel --url http://localhost:${port}\n`);
    });
}

module.exports = { init };
