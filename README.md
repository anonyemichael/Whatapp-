# WhatsApp Marketing Bot

Automate your WhatsApp marketing with this powerful Node.js bot.

## Features

| Feature | Description |
|---|---|
| **Group Broadcast** | Auto-send marketing messages to all/selected groups on a cron schedule |
| **Status Updates** | Rotate through promotional texts posted as your WhatsApp status automatically |
| **Auto-Reply** | Instant keyword-triggered replies for common questions (price, order, location…) |
| **DM Campaign** | Bulk DM a contact list with personalised messages |
| **Welcome Message** | Greet new group members automatically |
| **Admin Commands** | Control the bot live via WhatsApp messages |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run the setup wizard (recommended)

```bash
npm run setup
```

Follow the prompts. It writes your number and preferences directly into `src/config.js`.

### 3. OR configure manually

Open `src/config.js` and set:

- `ownerNumber` – your WhatsApp number (international, no `+`, e.g. `2348012345678`)
- `adminNumbers` – numbers that can use admin commands
- Customise message lists, schedules, and feature flags

### 4. Start the bot

```bash
npm start
```

Scan the QR code shown in the terminal with **WhatsApp → Linked Devices → Link a Device**.

---

## Admin Commands

Send these from any admin number (via DM to yourself or any chat):

| Command | Description |
|---|---|
| `!blast <message>` | Immediately blast a custom message to all target groups |
| `!blastnow` | Run the next scheduled group broadcast right now |
| `!dm <number> <message>` | Send a direct message to any number |
| `!dmnow` | Run the DM campaign immediately |
| `!status <text>` | Update your WhatsApp status text right now |
| `!statusnow` | Post the next scheduled status update now |
| `!groups` | List all groups the bot is a member of |
| `!contacts` | Show your total contact count |
| `!help` | Show all commands |

---

## Configuration Reference (`src/config.js`)

### Auto-Reply Rules

```js
autoReply: {
  enabled: true,
  dmOnly: true,           // false = also reply in groups
  rules: [
    { keyword: 'price', reply: 'Our prices start from …' },
    // add as many as you like
  ]
}
```

### Scheduled Status Updates

```js
statusUpdate: {
  enabled: true,
  schedule: '0 8 * * *',   // every day at 8 AM (cron syntax)
  messages: [
    '🚀 Great deals today!',
    '💥 Flash Sale – DM us!',
  ],
  imagePath: '',            // optional: '/path/to/banner.jpg'
}
```

### Group Broadcasts

```js
groupBroadcast: {
  enabled: true,
  schedule: '0 10 * * *',
  targetGroups: [],         // [] = all groups; or ['Sales Group', 'Customers']
  messages: [ '…' ],
  delayMs: 3000,            // delay between groups (avoid ban)
  imagePath: '',
}
```

### DM Campaign

```js
dmCampaign: {
  enabled: false,
  schedule: '0 9 * * 1',   // every Monday 9 AM
  contacts: ['2348012345678', '2348087654321'],
  messages: ['Hi {name}! Special offer for you…'],
  delayMs: 5000,
}
```

---

## Cron Schedule Examples

| Cron | Meaning |
|---|---|
| `0 8 * * *` | Every day at 8:00 AM |
| `0 10 * * 1-5` | Weekdays at 10:00 AM |
| `0 9,18 * * *` | 9 AM and 6 PM daily |
| `*/30 * * * *` | Every 30 minutes |
| `0 10 * * 1` | Every Monday at 10 AM |

---

## Tips to Avoid WhatsApp Bans

- Keep `delayMs` at 3000+ ms between group messages
- Don't blast the same message every hour — space it out
- Use natural-sounding messages, avoid spammy ALL-CAPS
- Don't add strangers to groups without permission
- Rotate your message list so it isn't identical every time

---

## Project Structure

```
src/
  index.js      – Bot entry point & event wiring
  config.js     – All settings (edit this!)
  scheduler.js  – Cron jobs (status, groups, DMs)
  commands.js   – Admin command parser & auto-reply
  logger.js     – Log to console + daily log files
  setup.js      – Interactive first-run wizard
logs/           – Daily log files (auto-created)
session/        – WhatsApp session cache (auto-created)
```
