# WhatsApp Marketing Bot

> **Automate your WhatsApp marketing with a powerful, self-hosted Node.js bot.**  
> Schedule broadcasts, auto-reply to messages, post status updates, and run DM campaigns — all from your terminal.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp-2.24.0+-25D366?logo=whatsapp&logoColor=white)
![Baileys](https://img.shields.io/badge/Baileys-6.0+-4CAF50?logo=github&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Linux-FCC624?logo=linux&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🎯 Overview

**WhatsApp Marketing Bot** is a self-hosted automation tool that lets you manage WhatsApp marketing at scale without paying for third-party SaaS platforms. Built on Node.js and Baileys, it connects to your personal WhatsApp account and executes marketing tasks 24/7.

### ⚡ What You Can Do

✅ **Schedule broadcasts** to all groups or selected groups on a cron schedule  
✅ **Post status updates** automatically with rotating promotional messages  
✅ **Auto-reply** to incoming messages with keyword-triggered responses  
✅ **Send DM campaigns** to contact lists with personalized messages  
✅ **Greet new members** automatically when they join groups  
✅ **Control via WhatsApp** using admin commands sent directly to the bot  

---

## ⚠️ Important Notice

**This bot uses your personal WhatsApp account.** WhatsApp may detect automated activity and temporarily or permanently ban your account. Use responsibly and follow these rules:

- ✅ Keep delays between messages (3000+ ms)
- ✅ Vary your messages — don't send identical content every time
- ✅ Use natural-sounding text, avoid ALL-CAPS spam
- ✅ Don't add strangers to groups without consent
- ✅ Space out broadcast schedules (not every hour)
- ⚠️ **Personal accounts are at risk** — consider using a dedicated WhatsApp account for this bot

---

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Admin Commands](#admin-commands)
- [Configuration](#configuration)
- [Cron Schedule Examples](#cron-schedule-examples)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Tips to Avoid Bans](#tips-to-avoid-bans)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Group Broadcast** | Auto-send marketing messages to all/selected groups on a schedule |
| **Status Updates** | Rotate through promotional texts posted as your WhatsApp status |
| **Auto-Reply** | Instant keyword-triggered replies for common questions (price, order, location…) |
| **DM Campaign** | Bulk DM a contact list with personalized messages |
| **Welcome Message** | Greet new group members automatically |
| **Admin Commands** | Control the bot live via WhatsApp messages |
| **Logging** | Daily log files for tracking all bot activity |
| **Error Handling** | Automatic reconnection on disconnects |
| **Flexible Scheduling** | Cron syntax for precise control over timing |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [install](https://nodejs.org/)
- **Linux/Mac** (Windows support coming)
- **WhatsApp account** (personal or dedicated)
- **Terminal access**

### Step 1: Clone & Install

```bash
git clone https://github.com/anonyemichael/Whatapp-Marketing-Bot.git
cd Whatapp-Marketing-Bot
npm install
```

### Step 2: Configure the Bot

```bash
cp .env.example .env
```

Edit `.env` and add:

```env
# Your WhatsApp number (international format, no +)
OWNER_NUMBER=233XXXXXXXXX

# Admin numbers that can control the bot via WhatsApp
ADMIN_NUMBERS=233XXXXXXXXX,233YYYYYYYYY

# Enable/disable features
ENABLE_AUTO_REPLY=true
ENABLE_STATUS_UPDATE=true
ENABLE_GROUP_BROADCAST=true
ENABLE_DM_CAMPAIGN=false
ENABLE_WELCOME_MESSAGE=true

# Log level (error, warn, info, debug)
LOG_LEVEL=info
```

### Step 3: Run the Bot

```bash
npm start
```

You'll see a QR code in the terminal. Scan it with WhatsApp:
- Open **WhatsApp**
- Go to **Settings → Linked Devices → Link a Device**
- Point your phone camera at the QR code
- Done!

The bot is now running and will stay connected 24/7.

---

## 🎮 Admin Commands

Send these commands via WhatsApp DM or in any group (if you're an admin):

| Command | Example | Description |
|---------|---------|-------------|
| `!blast <message>` | `!blast Check out our new products!` | Immediately send custom message to all target groups |
| `!blastnow` | `!blastnow` | Run the next scheduled group broadcast right now |
| `!dm <number> <message>` | `!dm 233501234567 Hello! Check our new offer` | Send DM to any number |
| `!dmnow` | `!dmnow` | Run the DM campaign immediately |
| `!status <text>` | `!status 🔥 Flash sale today only!` | Update your WhatsApp status text right now |
| `!statusnow` | `!statusnow` | Post the next scheduled status update now |
| `!groups` | `!groups` | List all groups the bot is a member of |
| `!contacts` | `!contacts` | Show total contact count |
| `!help` | `!help` | Show all available commands |
| `!stop` | `!stop` | Gracefully shut down the bot |
| `!restart` | `!restart` | Restart the bot connection |

---

## ⚙️ Configuration

Edit `src/config.js` to customize the bot's behavior:

### Auto-Reply

Keyword-triggered automatic responses:

```javascript
autoReply: {
  enabled: true,
  dmOnly: true,           // false = reply in groups too
  rules: [
    { 
      keyword: 'price', 
      reply: 'Our prices start from GHS 50. Check our catalog for details!' 
    },
    { 
      keyword: 'order', 
      reply: 'To order, visit stayhubgh.com or DM us your requirements' 
    },
    { 
      keyword: 'location', 
      reply: 'We are based in Accra. Delivery available nationwide!' 
    },
    // Add as many rules as needed
  ]
}
```

### Scheduled Status Updates

Post promotional status messages on a schedule:

```javascript
statusUpdate: {
  enabled: true,
  schedule: '0 8,14,20 * * *',   // 8 AM, 2 PM, 8 PM daily (cron syntax)
  messages: [
    '🚀 Great deals this week!',
    '💥 Flash Sale — Limited Time!',
    '✨ New products just arrived',
    '🎁 Referral bonus for you!',
  ],
  imagePath: 'assets/banner.jpg',  // optional: path to image
}
```

### Group Broadcasts

Schedule marketing messages to group(s):

```javascript
groupBroadcast: {
  enabled: true,
  schedule: '0 10 * * 1-5',      // 10 AM, Monday-Friday (cron syntax)
  targetGroups: [],               // [] = all groups; or ['Sales', 'Customers']
  messages: [
    '📢 New offer: Buy 2 Get 1 Free!',
    '⏰ Weekend special starting tomorrow',
    '🎉 Celebrate with us this month!',
  ],
  delayMs: 3000,                  // 3 second delay between groups (avoid ban)
  imagePath: '',                  // optional image
}
```

### DM Campaign

Send personalized DMs to a contact list:

```javascript
dmCampaign: {
  enabled: false,                           // Set to true to enable
  schedule: '0 9 * * 1',                   // Every Monday at 9 AM
  contacts: [
    '233501234567',
    '233502345678',
    '233503456789',
  ],
  messages: [
    'Hi! New product just for you. Check it out 👇',
    'Special offer this week. Link: stayhubgh.com',
  ],
  delayMs: 5000,                           // 5 second delay between DMs
}
```

### Welcome Messages

Greet new members automatically:

```javascript
welcomeMessage: {
  enabled: true,
  message: '👋 Welcome to our group! We share updates, tips, and special offers here.',
  delayMs: 2000,                  // Delay before sending (let other greetings pass)
}
```

---

## ⏰ Cron Schedule Examples

The bot uses standard cron syntax (5 fields):

| Cron Expression | Meaning |
|---|---|
| `0 8 * * *` | Every day at 8:00 AM |
| `0 9,18 * * *` | 9 AM and 6 PM daily |
| `0 10 * * 1-5` | Weekdays (Mon-Fri) at 10 AM |
| `0 10 * * 1` | Every Monday at 10 AM |
| `*/30 * * * *` | Every 30 minutes |
| `0 0 * * 0` | Every Sunday at midnight |
| `0 10 1 * *` | First day of every month at 10 AM |

**Timezone:** UTC (adjust for your local time)

---

## 📁 Project Structure

```
Whatapp-Marketing-Bot/
├── src/
│   ├── index.js           # Bot entry point & event handlers
│   ├── config.js          # Configuration (EDIT THIS!)
│   ├── scheduler.js       # Cron job setup (status, groups, DMs)
│   ├── commands.js        # Admin command parser & auto-reply
│   ├── logger.js          # Console + file logging
│   └── setup.js           # Interactive setup wizard (optional)
├── logs/                  # Auto-created daily log files
├── session/               # WhatsApp session cache (auto-created)
├── .env.example           # Environment template
├── package.json           # Dependencies
└── README.md              # This file
```

---

## 🌐 Deployment

### Option 1: Run on Your Computer

Perfect for testing:

```bash
npm start
```

Keep the terminal open — the bot runs while this process is active.

### Option 2: Run as Background Service (Linux)

Install PM2 to keep the bot running after logout:

```bash
npm install -g pm2
pm2 start src/index.js --name "whatsapp-bot"
pm2 save
pm2 startup
```

Check status:
```bash
pm2 status
```

View logs:
```bash
pm2 logs whatsapp-bot
```

### Option 3: Deploy to VPS (Linux)

For 24/7 operation on a server:

**1. Get a VPS** (Hostinger, DigitalOcean, Linode, ~$5/month)

**2. SSH into your server:**
```bash
ssh root@YOUR_VPS_IP
```

**3. Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**4. Clone and setup:**
```bash
git clone https://github.com/anonyemichael/Whatapp-Marketing-Bot.git bot
cd bot
npm install
cp .env.example .env
# Edit .env with your details
nano .env
```

**5. Run with PM2:**
```bash
npm install -g pm2
pm2 start src/index.js --name "whatsapp-bot"
pm2 save
pm2 startup
```

**6. Check logs anytime:**
```bash
pm2 logs whatsapp-bot
```

---

## 🐛 Troubleshooting

### QR Code Not Appearing

**Issue:** Terminal doesn't show QR code after `npm start`.

**Solution:**
1. Make sure terminal is large enough (at least 100 columns wide)
2. Check Node.js version: `node --version` (must be 18+)
3. Try clearing the `session/` folder and restart:
   ```bash
   rm -rf session/
   npm start
   ```

### Messages Not Sending

**Issue:** Bot runs but groups don't receive messages.

**Solution:**
1. Check bot is a member of the target groups
2. Verify cron schedule is correct (check system time with `date`)
3. Look at logs: `tail -f logs/$(date +%Y-%m-%d).log`
4. Check if bot has permission to post in groups

### Bot Disconnects After a While

**Issue:** Bot stops sending messages after running for hours/days.

**Solution:**
1. WhatsApp may have logged you out — scan QR code again
2. Run on a VPS with PM2 (auto-restart on disconnect)
3. Add error handling in `.env`: `AUTO_RECONNECT=true`

### Account Getting Banned/Restricted

**Issue:** WhatsApp warns "suspicious activity" or temporarily restricts your account.

**Solution:**
1. Stop the bot immediately
2. Wait 24-48 hours before using WhatsApp again
3. Reduce broadcast frequency and message volume
4. Increase delays between messages (5000+ ms)
5. Use a dedicated WhatsApp account next time

---

## ⚠️ Tips to Avoid WhatsApp Bans

**Keep delays reasonable:**
- Minimum 3000ms (3 seconds) between group messages
- Minimum 5000ms (5 seconds) between DMs
- Spread broadcasts over the day, not all at once

**Vary your messages:**
- Don't send identical message every hour
- Rotate message list
- Use natural language (no emoji spam)

**Follow WhatsApp rules:**
- Don't add strangers without consent
- Don't spam — only market to interested contacts
- Don't bulk add people to groups
- Don't use bots for harassment

**Monitor your account:**
- Keep 1-2 tabs of manual WhatsApp use daily (makes account look active)
- Check for warnings from WhatsApp
- Watch for rate-limiting (slow message sends = ban incoming)

---

## 📊 Logs

The bot creates daily log files in `logs/`:

```
logs/
├── 2026-07-14.log
├── 2026-07-15.log
└── 2026-07-16.log
```

View logs in real-time:
```bash
tail -f logs/$(date +%Y-%m-%d).log
```

Check specific activity:
```bash
grep "BROADCAST SENT" logs/2026-07-14.log
grep "ERROR" logs/2026-07-14.log
```

---

## 📝 Contributing

Contributions welcome! To improve the bot:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

### Ideas for Contributions

- [ ] Windows support
- [ ] Web dashboard for managing schedules
- [ ] Database persistence for sent messages
- [ ] Analytics on message delivery rates
- [ ] Media message support (images, videos)
- [ ] Conversation tracking (remember chat history)

---

## 📄 License

MIT License — use freely in personal and commercial projects.

© 2026 **Anonye Michael Ayinterima**. All rights reserved.

---

## 👨‍💼 Author

**Anonye Michael Ayinterima**  
*Computer Engineering Student at UENR*  
*Software Engineer & Full-Stack Developer*

- **GitHub**: [@anonyemichael](https://github.com/anonyemichael)
- **LinkedIn**: [Anonye Michael](https://linkedin.com/in/anonye-michael-39112437b)
- **Email**: anonyemichael6@gmail.com

---

## 🙏 Support

Have questions or encountered an issue?

- **Report Bugs**: [GitHub Issues](https://github.com/anonyemichael/Whatapp-Marketing-Bot/issues)
- **Email**: anonyemichael6@gmail.com
- **WhatsApp**: Contact via WhatsApp (when bot is running)

---

## 📚 Resources

- [Node.js Docs](https://nodejs.org/docs/)
- [Baileys Library](https://github.com/WhiskeySockets/Baileys)
- [Cron Job Syntax](https://crontab.guru/)
- [PM2 Documentation](https://pm2.keymetrics.io/)

---

**Built with ❤️ for marketing automation in Ghana and beyond.**
