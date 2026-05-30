'use strict';

/**
 * Central configuration for the WhatsApp Marketing Bot.
 * Edit this file to customise all bot behaviour.
 */
module.exports = {

    // ─── OWNER / ADMIN ────────────────────────────────────────────────────────
    // Your WhatsApp number in international format WITHOUT '+' or spaces.
    // e.g. "2348012345678"  (Nigeria) or "12025550199" (US)
    ownerNumber: process.env.OWNER_NUMBER || '233533311532',

    // Numbers that can use admin bot commands (include ownerNumber)
    adminNumbers: (process.env.ADMIN_NUMBERS || '233533311532').split(','),

    // ─── AUTO-REPLY ───────────────────────────────────────────────────────────
    autoReply: {
        enabled: true,
        // keyword → reply text (case-insensitive matching)
        rules: [
            { keyword: 'hi',        reply: 'Hello! 👋 How can I help you today?' },
            { keyword: 'hello',     reply: 'Hi there! 😊 Welcome!' },
            { keyword: 'price',     reply: '💰 Check our latest prices here: [your link]' },
            { keyword: 'order',     reply: '🛒 To place an order reply with your details or visit [your link]' },
            { keyword: 'available', reply: '✅ Yes we are available! Send "price" to see our catalogue.' },
            { keyword: 'location',  reply: '📍 We are located at [your address]. DM for directions!' },
            { keyword: 'contact',   reply: '📞 Reach us at [phone/email]. We reply within 1 hour.' },
        ],
        // Only auto-reply in DMs (false = also reply in groups)
        dmOnly: true,
    },

    // ─── STATUS / STORY AUTO-UPDATE ───────────────────────────────────────────
    statusUpdate: {
        enabled: true,
        // cron expression: "minute hour day month weekday"
        // Default: every day at 08:00 AM
        schedule: '0 8 * * *',
        // Messages rotate through this list
        messages: [
            '🚀 Good morning! Check out our latest deals today!',
            '💥 Flash Sale! Limited time offers – DM us now!',
            '✨ Quality products, unbeatable prices. Order today!',
            '🎁 Special offer just for you! Reply "DEAL" to learn more.',
            '📦 Fast delivery guaranteed! Place your order now.',
        ],
        // Optional: path to an image file to post as status (leave blank for text-only)
        imagePath: '',
    },

    // ─── GROUP BROADCAST ──────────────────────────────────────────────────────
    groupBroadcast: {
        enabled: true,
        // cron expression – default: every day at 10:00 AM
        schedule: '0 10 * * *',
        // List of group names to target (partial match, case-insensitive).
        // Leave empty [] to broadcast to ALL groups.
        targetGroups: [],
        // Messages rotate through this list
        messages: [
            '📢 *ANNOUNCEMENT* 📢\n\nHello everyone! We have exciting offers today. Reply to this message or DM us for more info!\n\n#Marketing #Deals',
            '🔥 *HOT DEAL ALERT* 🔥\n\nLimited stock available! Get yours before it runs out.\n\nContact us now 👇',
            '🎉 *SPECIAL PROMOTION* 🎉\n\nExclusive discount for group members only!\nValid today only – don\'t miss out!',
        ],
        // Delay between each group message (milliseconds) – avoid spam detection
        delayMs: 3000,
        // Optional: path to an image to attach to group messages
        imagePath: '',
    },

    // ─── DM CAMPAIGN ─────────────────────────────────────────────────────────
    dmCampaign: {
        enabled: false,
        // cron expression – default: every Monday at 9:00 AM
        schedule: '0 9 * * 1',
        // Target phone numbers (international, no '+')
        contacts: [
            // '2348012345678',
            // '2348087654321',
        ],
        messages: [
            'Hi {name}! 👋 We have a special offer just for you. Reply for details!',
            'Hello {name}! Exclusive deal available today only. Interested?',
        ],
        // Delay between each DM (ms)
        delayMs: 5000,
    },

    // ─── WELCOME MESSAGE ──────────────────────────────────────────────────────
    welcomeMessage: {
        enabled: true,
        // {name} is replaced with the new member's display name
        text: 'Welcome to the group, *{name}*! 🎉\n\nWe\'re glad you\'re here. Feel free to ask us anything!',
    },

    // ─── COMMAND PREFIX ──────────────────────────────────────────────────────
    // Admin commands are triggered by this prefix (e.g. !blast, !status)
    commandPrefix: '!',
};
