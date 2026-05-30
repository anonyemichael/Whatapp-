'use strict';

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const config = require('./config');
const scheduler = require('./scheduler');
const commands = require('./commands');
const logger = require('./logger');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session' }),
    puppeteer: {
        headless: true,
        executablePath: process.env.CHROME_PATH || undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors'
        ]
    }
});

let pairingRequested = false;

client.on('qr', async (qr) => {
    if (!pairingRequested) {
        pairingRequested = true;
        try {
            const phoneNumber = config.ownerNumber;
            console.log(chalk.cyan(`\n[BOT] Requesting pairing code for +${phoneNumber}...\n`));
            const code = await client.requestPairingCode(phoneNumber);
            const formatted = code.match(/.{1,4}/g).join('-');
            console.log(chalk.green('╔══════════════════════════════════╗'));
            console.log(chalk.green('║  YOUR WHATSAPP PAIRING CODE:     ║'));
            console.log(chalk.yellow(`║       ${formatted}       ║`));
            console.log(chalk.green('╚══════════════════════════════════╝'));
            console.log(chalk.cyan('\nSteps:'));
            console.log('  1. Open WhatsApp on your phone');
            console.log('  2. Tap ⋮ Menu > Linked Devices > Link a Device');
            console.log('  3. Tap "Link with phone number instead"');
            console.log(`  4. Enter code: ${chalk.bold(formatted)}\n`);
        } catch (err) {
            console.log(chalk.yellow('\n[BOT] Pairing code unavailable, falling back to QR code:\n'));
            qrcode.generate(qr, { small: true });
        }
    }
});

client.on('ready', async () => {
    console.log(chalk.green('\n[BOT] WhatsApp Marketing Bot is READY!\n'));
    logger.log('Bot started successfully');

    // Start all scheduled jobs
    scheduler.init(client);

    console.log(chalk.blue('[BOT] Active features:'));
    console.log('  • Scheduled group broadcasts');
    console.log('  • Auto status updates');
    console.log('  • Auto-reply to keywords');
    console.log('  • Contact-based DM campaigns');
    console.log('  • Welcome messages for new group members\n');
});

client.on('authenticated', () => {
    console.log(chalk.green('[BOT] Authenticated successfully!'));
});

client.on('auth_failure', (msg) => {
    console.error(chalk.red('[BOT] Authentication failed:', msg));
    process.exit(1);
});

client.on('disconnected', (reason) => {
    console.log(chalk.yellow('[BOT] Disconnected:', reason));
    logger.log(`Disconnected: ${reason}`);
    process.exit(0);
});

// Handle incoming messages (auto-reply & command engine)
client.on('message', async (msg) => {
    try {
        await commands.handle(client, msg);
    } catch (err) {
        logger.error('message handler', err);
    }
});

// Welcome new group members
client.on('group_join', async (notification) => {
    try {
        if (!config.welcomeMessage.enabled) return;

        const chat = await notification.getChat();
        const contact = await notification.getContact();
        const name = contact.pushname || contact.number;
        const text = config.welcomeMessage.text.replace('{name}', name);
        await chat.sendMessage(text);
        logger.log(`Welcome message sent to ${name} in ${chat.name}`);
    } catch (err) {
        logger.error('group_join handler', err);
    }
});

client.initialize();
