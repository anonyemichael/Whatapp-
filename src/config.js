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
                reply: `👋 Hey there! Welcome to *StayHub Ghana* 🏠\n\nFind verified student hostels near KNUST, UG, UENR & UDS — with video tours and secure escrow payments!\n\nReply *download* to get the app 📲`,
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
                reply: `🏠 *List Your Hostel on StayHub!*\n\nAre you a hostel owner or agent? Join 1000s of verified agents already on StayHub!\n\n✅ Get more students to see your rooms\n✅ Upload video tours to attract bookings\n✅ Get paid instantly when guests check in\n✅ Free to list!\n\n🌐 Register at: https://stayhubgh.com\nor reply *contact* to speak with us.`,
            },
            {
                keyword: 'knust',
                reply: `🎓 *Looking for a hostel near KNUST?*\n\nStayHub has verified hostels close to KNUST with video tours so you can see the room before booking!\n\n🔒 Escrow payment = no scams\n📲 Download: https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
            {
                keyword: 'ug',
                reply: `🎓 *Looking for a hostel near UG (Legon)?*\n\nStayHub has verified hostels near University of Ghana with real video tours!\n\n🔒 Pay safely with our escrow system\n📲 Download: https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
            {
                keyword: 'uenr',
                reply: `🎓 *Hostel near UENR?*\n\nFind verified, affordable hostels near UENR on StayHub — watch video tours & book safely!\n\n📲 Download: https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
            {
                keyword: 'uds',
                reply: `🎓 *Hostel near UDS?*\n\nStayHub has verified hostels near University for Development Studies! Watch video tours before you pay.\n\n🔒 Escrow payment protects your money\n📲 Download: https://play.google.com/store/apps/details?id=com.stayhub.app`,
            },
            {
                keyword: 'price',
                reply: `💰 *StayHub is FREE to use!*\n\nDownload the app free and browse hundreds of verified hostels near your school.\n\n📲 https://play.google.com/store/apps/details?id=com.stayhub.app\n\nHostel prices vary by school and location — search the app to compare!`,
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
                reply: `🏠 *Find Your Perfect Hostel with StayHub!*\n\n✅ Verified hostels near KNUST, UG, UENR & UDS\n✅ Watch video tours before booking\n✅ Pay safely with escrow\n✅ No scams, no stress!\n\n📲 Download FREE: https://play.google.com/store/apps/details?id=com.stayhub.app`,
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
            '🏠 Find verified student hostels near KNUST, UG, UENR & UDS!\n\nDownload StayHub Ghana – #1 hostel booking app 📲\nhttps://stayhubgh.com',
            '🔒 Tired of hostel scams in Ghana?\n\nStayHub protects your money with ESCROW payments!\nPay only when you check in ✅\n\nDownload FREE 👉 https://stayhubgh.com',
            '🎥 See your hostel BEFORE you pay!\n\nStayHub has video tours for every listing 📹\nNo surprises. No scams. Just great hostels!\n\n📲 Download: https://stayhubgh.com',
            '🎓 New semester? Find your hostel stress-free!\n\nStayHub – Ghana\'s #1 verified student hostel app\n✅ Near KNUST, UG, UENR & UDS\n\n📲 https://stayhubgh.com',
            '🏠 Hostel owners & agents!\n\nList your property on StayHub and get MORE bookings from students 📈\n\n✅ Free to list\n✅ Video tours\n✅ Instant payments when guests check in\n\n🌐 https://stayhubgh.com',
            '💰 Student housing shouldn\'t cost you your peace of mind!\n\nStayHub = verified hostels + escrow payments + video tours\n\nDownload FREE 📲 https://stayhubgh.com',
            '📲 Over 1000s of students trust StayHub Ghana for safe hostel bookings!\n\nJoin them today 👇\nhttps://stayhubgh.com',
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
            `🏠 *STAYHUB GHANA* 🏠\n\nLooking for a hostel near *KNUST, UG, UENR or UDS?*\n\n✅ Verified hostels\n🎥 Video tours – see before you pay\n🔒 Escrow payment – no scams\n📲 FREE to download!\n\n👉 https://stayhubgh.com\n👉 Play Store: https://play.google.com/store/apps/details?id=com.stayhub.app`,

            `🔒 *NO MORE HOSTEL SCAMS!* 🔒\n\nStayHub Ghana protects every student with our *Escrow Payment System:*\n\n1️⃣ Book your hostel on the app\n2️⃣ Pay securely into escrow\n3️⃣ Check in & confirm\n4️⃣ Agent gets paid ONLY then!\n\nYour money is ALWAYS safe 💪\n\n📲 Download FREE: https://stayhubgh.com`,

            `🎥 *SEE YOUR ROOM BEFORE YOU PAY!* 🎥\n\nStayHub Ghana has *video tours* for every hostel listing!\n\nWatch the room, bathroom, kitchen & compound from your phone – no surprises when you arrive 😎\n\n✅ Near KNUST, UG, UENR & UDS\n🔒 Safe escrow payments\n\n📲 https://play.google.com/store/apps/details?id=com.stayhub.app`,

            `🎓 *ATTENTION STUDENTS!* 🎓\n\nNew semester is coming – don't stress about accommodation!\n\nStayHub Ghana has HUNDREDS of verified hostels near your school 🏠\n\n✅ Video tours\n✅ Verified agents\n✅ Safe escrow payment\n✅ FREE app\n\n📲 Download now: https://stayhubgh.com`,

            `🏠 *HOSTEL OWNERS & AGENTS!*\n\nList your property on *StayHub Ghana* and reach thousands of students looking for hostels!\n\n✅ Free to list\n✅ Upload video tours\n✅ Get paid instantly when guests check in\n✅ Verified badge builds trust\n\n🌐 Register at: https://stayhubgh.com`,

            `📲 *STAYHUB – Ghana's #1 Student Hostel App*\n\nJoining thousands of students who book safely every semester!\n\n🎯 Find hostels near:\n• KNUST (Kumasi)\n• UG (Legon)\n• UENR (Sunyani)\n• UDS (Tamale)\n\n🔒 Escrow payments\n🎥 Video tours\n✅ Verified listings\n\nDownload FREE 👉 https://stayhubgh.com`,
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
            `👋 Hi {name}!\n\nLooking for student accommodation near your school in Ghana?\n\n🏠 *StayHub Ghana* has you covered!\n✅ Verified hostels near KNUST, UG, UENR & UDS\n🎥 Video tours before you pay\n🔒 Escrow payment – zero scam risk\n\n📲 Download FREE: https://play.google.com/store/apps/details?id=com.stayhub.app`,

            `Hey {name}! 👋\n\nNew semester coming up? Don't struggle with hostel hunting!\n\nDownload *StayHub Ghana* – Ghana's #1 verified student hostel booking app 🏠\n\n🔒 Safe payments\n🎥 See rooms via video tour\n✅ Verified agents only\n\nhttps://stayhubgh.com`,

            `Hi {name}! 🏠\n\nAre you a hostel owner or agent in Ghana?\n\nJoin *StayHub Ghana* and get more student bookings every semester!\n\n✅ Free to list your property\n✅ Upload video tours\n✅ Get paid instantly at check-in\n\n🌐 Register: https://stayhubgh.com`,
        ],
        delayMs: 5000,
        imagePath: '',
        videoPath: '',
    },

    // ─── WELCOME MESSAGE ──────────────────────────────────────────────────────
    welcomeMessage: {
        enabled: true,
        text: `👋 Welcome *{name}*!\n\n🏠 This is the official *StayHub Ghana* community – Ghana's #1 verified student hostel booking app!\n\nNeed a hostel near KNUST, UG, UENR or UDS? We've got you covered 💪\n\n📲 Download the app FREE: https://stayhubgh.com\n\nFeel free to ask any questions!`,
    },

    // ─── COMMAND PREFIX ──────────────────────────────────────────────────────
    commandPrefix: '!',
};
