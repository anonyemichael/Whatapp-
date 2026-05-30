'use strict';

/**
 * Central configuration for the WhatsApp Marketing Bot.
 * Edit this file to customise all bot behaviour.
 */
module.exports = {

    // ─── OWNER / ADMIN ────────────────────────────────────────────────────────
    ownerNumber: process.env.OWNER_NUMBER || '233533311532',
    adminNumbers: (process.env.ADMIN_NUMBERS || '233533311532').split(','),

    // ─── AUTO-REPLY ───────────────────────────────────────────────────────────
    autoReply: {
        enabled: true,
        dmOnly: true,
        rules: [
            { keyword: 'hi',        reply: 'Hello! 👋 How can I help you today?' },
            { keyword: 'hello',     reply: 'Hi there! 😊 Welcome!' },
            { keyword: 'price',     reply: '💰 Check our latest prices here: [your link]' },
            { keyword: 'order',     reply: '🛒 To place an order reply with your details or visit [your link]' },
            { keyword: 'available', reply: '✅ Yes we are available! Send "price" to see our catalogue.' },
            { keyword: 'location',  reply: '📍 We are located at [your address]. DM for directions!' },
            { keyword: 'contact',   reply: '📞 Reach us at [phone/email]. We reply within 1 hour.' },
        ],
    },

    // ─── STATUS / STORY AUTO-UPDATE ───────────────────────────────────────────
    statusUpdate: {
        enabled: true,
        schedule: '0 8 * * *',
        messages: [
            '🚀 Good morning! Check out our latest deals today!',
            '💥 Flash Sale! Limited time offers – DM us now!',
            '✨ Quality products, unbeatable prices. Order today!',
            '🎁 Special offer just for you! Reply "DEAL" to learn more.',
            '📦 Fast delivery guaranteed! Place your order now.',
        ],
        // Media to post as status — set ONE of these (video takes priority over image)
        // Leave both blank for text-only status
        imagePath: '',   // e.g. './media/banner.jpg'
        videoPath: '',   // e.g. './media/promo.mp4'  (max ~16 MB recommended)
        // Caption shown on image/video status (leave blank to use rotating messages above)
        mediaCaption: '',
    },

    // ─── GROUP BROADCAST ──────────────────────────────────────────────────────
    groupBroadcast: {
        enabled: true,
        schedule: '0 10 * * *',
        // Partial group name matches (case-insensitive). Empty [] = all groups.
        targetGroups: [],
        messages: [
            '📢 *ANNOUNCEMENT* 📢\n\nHello everyone! We have exciting offers today. Reply to this message or DM us for more info!\n\n#Marketing #Deals',
            '🔥 *HOT DEAL ALERT* 🔥\n\nLimited stock available! Get yours before it runs out.\n\nContact us now 👇',
            '🎉 *SPECIAL PROMOTION* 🎉\n\nExclusive discount for group members only!\nValid today only – don\'t miss out!',
        ],
        delayMs: 3000,
        // Attach media to group messages — video takes priority over image
        imagePath: '',   // e.g. './media/promo.jpg'
        videoPath: '',   // e.g. './media/promo.mp4'
    },

    // ─── DM CAMPAIGN ─────────────────────────────────────────────────────────
    dmCampaign: {
        enabled: false,
        schedule: '0 9 * * 1',
        contacts: [
            // '233201234567',
        ],
        messages: [
            'Hi {name}! 👋 We have a special offer just for you. Reply for details!',
            'Hello {name}! Exclusive deal available today only. Interested?',
        ],
        delayMs: 5000,
        // Attach media to DMs — video takes priority over image
        imagePath: '',
        videoPath: '',
    },

    // ─── WELCOME MESSAGE ──────────────────────────────────────────────────────
    welcomeMessage: {
        enabled: true,
        text: 'Welcome to the group, *{name}*! 🎉\n\nWe\'re glad you\'re here. Feel free to ask us anything!',
    },

    // ─── COMMAND PREFIX ──────────────────────────────────────────────────────
    commandPrefix: '!',
};
