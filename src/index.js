'use strict';

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const scheduler = require('./scheduler');
const commands = require('./commands');
const logger = require('./logger');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log(chalk.cyan('\n[BOT] Scan this QR code with WhatsApp to log in:\n'));
    qrcode.generate(qr, { small: true });
    console.log(chalk.yellow('\n[BOT] Open WhatsApp > Linked Devices > Link a Device\n'));
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
        const config = require('./config');
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
