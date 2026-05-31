'use strict';

module.exports = {

    // ─── OWNER / ADMIN ────────────────────────────────────────────────────────
    ownerNumber: process.env.OWNER_NUMBER || '233533311532',
    adminNumbers: (process.env.ADMIN_NUMBERS || '233533311532').split(','),

    // ─── AUTO-REPLY ───────────────────────────────────────────────────────────
    autoReply: {
        enabled: true,
        dmOnly: true,
        rules: [
            {
                keyword: 'hi',
                reply: `👋 Hello! Welcome to *StayHub Ghana* 🏠\n\nThe #1 verified student hostel booking app in Ghana!\n\nReply with any of these to learn more:\n• *download* – Get the app\n• *how* – How it works\n• *list* – List your hostel\n• *safe* – How we protect you`,
            },
            {
                keyword: 'hello',
                reply: `👋 Hey there! Welcome to *StayHub Ghana* 🏠\n\nFind verified student hostels near *UENR, UDS & CUG* — with video tours and secure escrow payments!\n\nReply *download* to get the app 📲`,
            },
            {
                keyword: 'download',
                reply: `📲 *Download StayHub Now!*\n\n🔗 Google Play Store:\nhttps://play.google.com/store/apps/details?id=com.stayhub.app\n\n🌐 Website:\nhttps://stayhubgh.com\n\nIt's FREE to download! Find your perfect hostel in minutes ✅`,
            },
            {
                keyword: 'how',
                reply: `📖 *How StayHub Works:*\n\n1️⃣ Download the app (free)\n2️⃣ Search hostels near your school\n3️⃣ Watch video tours from your phone\n4️⃣ Book securely with escrow payment\n5️⃣ Move in stress-free!\n\n🔒 Your money is protected until you check in.\n\n📲 Download: https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
            {
                keyword: 'safe',
                reply: `🔒 *Your Money is 100% Safe on StayHub!*\n\nWe use an *Escrow Payment System* — meaning:\n✅ You pay into escrow (held securely)\n✅ You check in and confirm everything is okay\n✅ The agent gets paid ONLY then\n\nNo more hostel scams in Ghana! 💪\n\n📲 Download: https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
            {
                keyword: 'list',
                reply: `🏠 *List Your Hostel on StayHub!*\n\nAre you a hostel owner or agent? Join verified agents already on StayHub!\n\n✅ Get more students to see your rooms\n✅ Upload video tours to attract bookings\n✅ Get paid instantly when guests check in\n✅ Free to list!\n\n🌐 Register at: https://stayhubgh.com\nor reply *contact* to speak with us.`,
            },
            {
                keyword: 'uenr',
                reply: `🎓 *Looking for a hostel near UENR?*\n\nStayHub has verified hostels near the University of Energy and Natural Resources in Sunyani!\n\n🎥 Watch video tours before you pay\n🔒 Escrow payment = no scams\n\n📲 Download FREE: https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
            {
                keyword: 'uds',
                reply: `🎓 *Looking for a hostel near UDS?*\n\nStayHub has verified hostels near the University for Development Studies!\n\n🎥 Watch video tours before you pay\n🔒 Your money is safe with our escrow system\n\n📲 Download FREE: https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
            {
                keyword: 'cug',
                reply: `🎓 *Looking for a hostel near CUG?*\n\nStayHub has verified hostels near Catholic University College of Ghana!\n\n🎥 Watch video tours before you pay\n🔒 Escrow payment = your money is safe\n\n📲 Download FREE: https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
            {
                keyword: 'price',
                reply: `💰 *StayHub is FREE to use!*\n\nDownload the app free and browse verified hostels near UENR, UDS & CUG.\n\n📲 https://play.google.com/store/apps/details?id=com.stayhub.app\n\nHostel prices vary by school and location — search the app to compare!`,
            },
            {
                keyword: 'scam',
                reply: `🛡️ *No more hostel scams with StayHub!*\n\nOur *Escrow System* means you NEVER lose your money:\n✅ Pay securely into escrow\n✅ Only released to agent after you check in\n✅ All agents are verified by StayHub\n\n📲 Download: https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
            {
                keyword: 'video',
                reply: `🎥 *Virtual Room Tours on StayHub!*\n\nSee exactly what you're getting BEFORE you pay — no surprises!\n\nAll listings on StayHub include video tours so you can check the room, bathroom, kitchen & environment from your phone.\n\n📲 Download: https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
            {
                keyword: 'contact',
                reply: `📞 *Contact StayHub Ghana:*\n\n🌐 Website: https://stayhubgh.com\n📲 App: https://play.google.com/store/apps/details?id=com.stayhub.app\n\nWe're here to help you find the perfect hostel! 🏠`,
            },
            {
                keyword: 'hostel',
                reply: `🏠 *Find Your Perfect Hostel with StayHub!*\n\n✅ Verified hostels near UENR, UDS & CUG\n🎥 Watch video tours before booking\n🔒 Pay safely with escrow\n✅ No scams, no stress!\n\n📲 Download FREE: https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
            {
                keyword: 'book',
                reply: `📅 *Book a Hostel on StayHub in 3 Easy Steps!*\n\n1️⃣ Download the app\n2️⃣ Search & watch video tours\n3️⃣ Book & pay securely\n\n🔒 Your money is protected by our escrow system until you check in!\n\n📲 https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
        ],
    },

    // ─── STATUS / STORY AUTO-UPDATE ───────────────────────────────────────────
    statusUpdate: {
        enabled: true,
        schedule: '0 8 * * *',
        messages: [
            '🏠 Find verified student hostels near UENR, UDS & CUG!\n\nDownload StayHub Ghana – #1 hostel booking app 📲\nhttps://stayhubgh.com',
            '🔒 Tired of hostel scams in Ghana?\n\nStayHub protects your money with ESCROW payments!\nPay only when you check in ✅\n\nDownload FREE 👉 https://stayhubgh.com',
            '🎥 See your hostel BEFORE you pay!\n\nStayHub has video tours for every listing 📹\nNo surprises. No scams. Just great hostels!\n\n📲 Download: https://stayhubgh.com',
            '🎓 New semester? Find your hostel stress-free!\n\nStayHub – Ghana\'s #1 verified student hostel app\n✅ Near UENR, UDS & CUG\n\n📲 https://stayhubgh.com',
            '🏠 Hostel owners & agents!\n\nList your property on StayHub and get MORE bookings from students 📈\n\n✅ Free to list\n✅ Video tours\n✅ Instant payments when guests check in\n\n🌐 https://stayhubgh.com',
            '💰 Student housing shouldn\'t cost you your peace of mind!\n\nStayHub = verified hostels + escrow payments + video tours\n\nDownload FREE 📲 https://stayhubgh.com',
            '📲 Students at UENR, UDS & CUG – stop stressing about accommodation!\n\nStayHub Ghana has you covered 🏠\nhttps://stayhubgh.com',
        ],
        imagePath: '',
        videoPath: '',
        mediaCaption: '',
    },

    // ─── GROUP BROADCAST ──────────────────────────────────────────────────────
    groupBroadcast: {
        enabled: true,
        schedule: '0 10 * * *',
        targetGroups: [],
        messages: [
            `🏠 *STAYHUB GHANA* 🏠\n\nLooking for a hostel near *UENR, UDS or CUG?*\n\n✅ Verified hostels\n🎥 Video tours – see before you pay\n🔒 Escrow payment – no scams\n📲 FREE to download!\n\n👉 https://stayhubgh.com\n👉 Play Store: https://play.google.com/store/apps/details?id=com.stayhub.app`,

            `🔒 *NO MORE HOSTEL SCAMS!* 🔒\n\nStayHub Ghana protects every student with our *Escrow Payment System:*\n\n1️⃣ Book your hostel on the app\n2️⃣ Pay securely into escrow\n3️⃣ Check in & confirm\n4️⃣ Agent gets paid ONLY then!\n\nYour money is ALWAYS safe 💪\n\n📲 Download FREE: https://stayhubgh.com`,

            `🎥 *SEE YOUR ROOM BEFORE YOU PAY!* 🎥\n\nStayHub Ghana has *video tours* for every hostel listing!\n\nWatch the room, bathroom, kitchen & compound from your phone – no surprises when you arrive 😎\n\n✅ Near UENR, UDS & CUG\n🔒 Safe escrow payments\n\n📲 https://play.google.com/store/apps/details?id=com.stayhub.app`,

            `🎓 *ATTENTION STUDENTS!* 🎓\n\nNew semester is coming – don't stress about accommodation!\n\nStayHub Ghana has verified hostels near your school 🏠\n\n✅ Video tours\n✅ Verified agents\n✅ Safe escrow payment\n✅ FREE app\n\n📲 Download now: https://stayhubgh.com`,

            `🏠 *HOSTEL OWNERS & AGENTS!*\n\nList your property on *StayHub Ghana* and reach students at UENR, UDS & CUG looking for hostels!\n\n✅ Free to list\n✅ Upload video tours\n✅ Get paid instantly when guests check in\n✅ Verified badge builds trust\n\n🌐 Register at: https://stayhubgh.com`,

            `📲 *STAYHUB – Ghana's #1 Student Hostel App*\n\nBook safely every semester!\n\n🎯 Find hostels near:\n• UENR (Sunyani)\n• UDS (Tamale/Wa)\n• CUG (Fiapre)\n\n🔒 Escrow payments\n🎥 Video tours\n✅ Verified listings\n\nDownload FREE 👉 https://stayhubgh.com`,
        ],
        delayMs: 3000,
        imagePath: '',
        videoPath: '',
    },

    // ─── DM CAMPAIGN ─────────────────────────────────────────────────────────
    dmCampaign: {
        enabled: false,
        schedule: '0 9 * * 1',
        contacts: [],
        messages: [
            `👋 Hi {name}!\n\nLooking for student accommodation near UENR, UDS or CUG?\n\n🏠 *StayHub Ghana* has you covered!\n✅ Verified hostels\n🎥 Video tours before you pay\n🔒 Escrow payment – zero scam risk\n\n📲 Download FREE: https://play.google.com/store/apps/details?id=com.stayhub.app`,

            `Hey {name}! 👋\n\nNew semester coming up? Don't struggle with hostel hunting!\n\nDownload *StayHub Ghana* – Ghana's #1 verified student hostel booking app 🏠\n\n🔒 Safe payments\n🎥 See rooms via video tour\n✅ Verified agents only\n\nhttps://stayhubgh.com`,

            `Hi {name}! 🏠\n\nAre you a hostel owner or agent near UENR, UDS or CUG?\n\nJoin *StayHub Ghana* and get more student bookings every semester!\n\n✅ Free to list your property\n✅ Upload video tours\n✅ Get paid instantly at check-in\n\n🌐 Register: https://stayhubgh.com`,
        ],
        delayMs: 5000,
        imagePath: '',
        videoPath: '',
    },

    // ─── WELCOME MESSAGE ──────────────────────────────────────────────────────
    welcomeMessage: {
        enabled: true,
        text: `👋 Welcome *{name}*!\n\n🏠 This is the official *StayHub Ghana* community – Ghana's #1 verified student hostel booking app!\n\nWe cover hostels near *UENR, UDS & CUG* 🎓\n\n📲 Download the app FREE: https://stayhubgh.com\n\nFeel free to ask any questions!`,
    },

    // ─── COMMAND PREFIX ──────────────────────────────────────────────────────
    commandPrefix: '!',
};
