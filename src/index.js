'use strict';

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    isJidGroup,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs-extra');
const chalk = require('chalk');
const config = require('./config');
const scheduler = require('./scheduler');
const commands = require('./commands');
const api = require('./api');
const logger = require('./logger');

const SESSION_DIR = './session';

async function askQuestion(q) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(q, ans => { rl.close(); resolve(ans.trim()); }));
}

async function connectToWhatsApp() {
    await fs.ensureDir(SESSION_DIR);
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Marketing Bot', 'Chrome', '120.0.0'],
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
    });

    // ─── PAIRING CODE ─────────────────────────────────────────────────────────
    if (!sock.authState.creds.registered) {
        const phone = config.ownerNumber;
        console.log(chalk.cyan(`\n[BOT] Requesting pairing code for +${phone}...\n`));
        await new Promise(r => setTimeout(r, 3000));
        try {
            const code = await sock.requestPairingCode(phone);
            const formatted = code.match(/.{1,4}/g).join('-');
            console.log(chalk.green('\n╔══════════════════════════════════╗'));
            console.log(chalk.green('║   YOUR WHATSAPP PAIRING CODE:    ║'));
            console.log(chalk.bold.yellow(`║         ${formatted}          ║`));
            console.log(chalk.green('╚══════════════════════════════════╝\n'));
            console.log(chalk.cyan('Steps:'));
            console.log('  1. Open WhatsApp on your phone');
            console.log('  2. Tap ⋮ > Linked Devices > Link a Device');
            console.log('  3. Tap "Link with phone number instead"');
            console.log(`  4. Enter code: ${chalk.bold.yellow(formatted)}`);
            console.log(chalk.yellow('\n  ⚠ You have ~60 seconds — enter it quickly!\n'));
        } catch (err) {
            console.error(chalk.red('[BOT] Could not get pairing code:'), err.message);
            console.log(chalk.yellow('[BOT] Retrying in 10 seconds...'));
            await new Promise(r => setTimeout(r, 10000));
            return connectToWhatsApp();
        }
    }

    // ─── CONNECTION EVENTS ────────────────────────────────────────────────────
    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = code !== DisconnectReason.loggedOut;
            logger.log(`Disconnected (code ${code}). Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 5000);
            } else {
                console.log(chalk.red('[BOT] Logged out. Delete ./session folder and restart.'));
                process.exit(0);
            }
        } else if (connection === 'open') {
            console.log(chalk.green('\n[BOT] WhatsApp Marketing Bot is READY!\n'));
            logger.log('Bot connected successfully');
            scheduler.init(sock);
            api.init(sock, process.env.API_PORT || 3000);
            console.log(chalk.blue('[BOT] Active features:'));
            console.log('  • Scheduled group broadcasts');
            console.log('  • Auto status updates');
            console.log('  • Auto-reply to keywords');
            console.log('  • Contact-based DM campaigns');
            console.log('  • Welcome messages for new group members\n');
            console.log(chalk.yellow(`  Send ${config.commandPrefix}help to yourself for admin commands\n`));
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // ─── MESSAGES ─────────────────────────────────────────────────────────────
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const msg of messages) {
            if (!msg.message) continue;
            try {
                await commands.handle(sock, msg);
            } catch (err) {
                logger.error('message handler', err);
            }
        }
    });

    // ─── GROUP MEMBER JOIN ────────────────────────────────────────────────────
    sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
        if (action !== 'add' || !config.welcomeMessage.enabled) return;
        try {
            const meta = await sock.groupMetadata(id);
            for (const jid of participants) {
                const num = jid.split('@')[0];
                const text = config.welcomeMessage.text.replace('{name}', `+${num}`);
                await sock.sendMessage(id, { text });
                logger.log(`Welcome sent to ${num} in ${meta.subject}`);
            }
        } catch (err) {
            logger.error('group join handler', err);
        }
    });

    return sock;
}

process.on('unhandledRejection', (reason) => {
    const code = reason?.output?.statusCode || reason;
    if (code === 1006 || code === 428 || code === 503) {
        // WebSocket/WhatsApp transient errors — reconnect
        logger.log(`Transient error (${code}), reconnecting in 5s...`);
        setTimeout(connectToWhatsApp, 5000);
    } else {
        console.error(chalk.red('[BOT] Unhandled error:'), reason);
    }
});

connectToWhatsApp().catch(err => {
    console.error(chalk.red('[BOT] Fatal error:'), err);
    process.exit(1);
});
