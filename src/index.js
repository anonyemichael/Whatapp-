'use strict';

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs-extra');
const http = require('http');
const QRCode = require('qrcode');
const chalk = require('chalk');
const config = require('./config');
const scheduler = require('./scheduler');
const commands = require('./commands');
const api = require('./api');
const logger = require('./logger');

const SESSION_DIR = './session';
const QR_PORT = 8080;

let qrServer = null;
let latestQR = null;

// ─── QR WEB SERVER ────────────────────────────────────────────────────────────
function startQRServer() {
    if (qrServer) return;
    qrServer = http.createServer(async (req, res) => {
        if (!latestQR) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<html><body style="background:#111;color:#fff;font-family:sans-serif;text-align:center;padding:40px"><h2>Waiting for QR code...</h2><script>setTimeout(()=>location.reload(),3000)</script></body></html>');
            return;
        }
        try {
            const qrDataURL = await QRCode.toDataURL(latestQR, { width: 300, margin: 2 });
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<!DOCTYPE html>
<html>
<head>
  <title>StayHub Bot - Scan QR</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { background:#111; color:#fff; font-family:sans-serif; text-align:center; padding:20px; }
    img { border-radius:12px; max-width:280px; width:90vw; }
    h2 { color:#25D366; }
    p { color:#aaa; font-size:14px; }
    .code { color:#FFD700; font-size:20px; font-weight:bold; letter-spacing:2px; }
  </style>
</head>
<body>
  <h2>StayHub WhatsApp Bot</h2>
  <p>Scan this QR code with WhatsApp to link the bot</p>
  <img src="${qrDataURL}" alt="QR Code"/>
  <p style="margin-top:16px">Steps:<br>
    1. Open <b>WhatsApp</b><br>
    2. Tap <b>⋮ → Linked Devices → Link a Device</b><br>
    3. Point camera at this QR code
  </p>
  <p style="color:#ff6b6b">⚠ Page auto-refreshes every 25 seconds for a new code</p>
  <script>setTimeout(()=>location.reload(), 25000)</script>
</body>
</html>`);
        } catch (e) {
            res.writeHead(500);
            res.end('Error generating QR');
        }
    });
    qrServer.listen(QR_PORT, () => {
        console.log(chalk.green(`\n╔═══════════════════════════════════════════╗`));
        console.log(chalk.green(`║  QR CODE READY — open in your browser:   ║`));
        console.log(chalk.bold.yellow(`║       http://localhost:${QR_PORT}              ║`));
        console.log(chalk.green(`╚═══════════════════════════════════════════╝`));
        console.log(chalk.cyan('\nThen tap ⋮ → Linked Devices → Link a Device and scan.\n'));
    });
}

function stopQRServer() {
    if (qrServer) { qrServer.close(); qrServer = null; }
}

// ─── MAIN CONNECTION ──────────────────────────────────────────────────────────
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
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '120.0.0'],
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
    });

    // ─── CONNECTION EVENTS ────────────────────────────────────────────────────
    sock.ev.on('connection.update', async ({ qr, connection, lastDisconnect }) => {
        if (qr) {
            latestQR = qr;
            startQRServer();
        }

        if (connection === 'close') {
            stopQRServer();
            const code = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = code !== DisconnectReason.loggedOut;
            logger.log(`Disconnected (code ${code}). Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 5000);
            } else {
                console.log(chalk.red('\n[BOT] Logged out. Delete the ./session folder and restart.'));
                process.exit(0);
            }
        } else if (connection === 'open') {
            stopQRServer();
            latestQR = null;
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

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify' && type !== 'append') return;
        for (const msg of messages) {
            if (!msg.message) continue;
            try { await commands.handle(sock, msg); }
            catch (err) { logger.error('message handler', err); }
        }
    });

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
        } catch (err) { logger.error('group join handler', err); }
    });

    return sock;
}

process.on('unhandledRejection', (reason) => {
    const code = reason?.output?.statusCode || reason;
    if (code === 1006 || code === 428 || code === 503) {
        logger.log(`Transient error (${code}), reconnecting in 8s...`);
        setTimeout(connectToWhatsApp, 8000);
    } else {
        console.error(chalk.red('[BOT] Unhandled error:'), reason);
    }
});

connectToWhatsApp().catch(err => {
    console.error(chalk.red('[BOT] Fatal error:'), err);
    process.exit(1);
});
