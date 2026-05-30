#!/usr/bin/env node
'use strict';

/**
 * Interactive setup wizard – run once before first launch.
 * Usage:  node src/setup.js
 */

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function main() {
    console.log(chalk.cyan('\n=== WhatsApp Marketing Bot – Setup Wizard ===\n'));

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'ownerNumber',
            message: 'Your WhatsApp number (international, no + or spaces, e.g. 2348012345678):',
            validate: v => /^\d{7,15}$/.test(v) ? true : 'Enter digits only, 7–15 characters',
        },
        {
            type: 'input',
            name: 'adminNumbers',
            message: 'Admin numbers (comma-separated, same format – leave blank to use owner only):',
            default: '',
        },
        {
            type: 'confirm',
            name: 'autoReply',
            message: 'Enable auto-reply for keyword triggers?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'statusUpdate',
            message: 'Enable scheduled status updates?',
            default: true,
        },
        {
            type: 'input',
            name: 'statusSchedule',
            message: 'Status update cron schedule (default = daily 8am):',
            default: '0 8 * * *',
            when: a => a.statusUpdate,
        },
        {
            type: 'confirm',
            name: 'groupBroadcast',
            message: 'Enable scheduled group broadcasts?',
            default: true,
        },
        {
            type: 'input',
            name: 'groupSchedule',
            message: 'Group broadcast cron schedule (default = daily 10am):',
            default: '0 10 * * *',
            when: a => a.groupBroadcast,
        },
        {
            type: 'input',
            name: 'targetGroups',
            message: 'Target group names (comma-separated partial matches, blank = all groups):',
            default: '',
            when: a => a.groupBroadcast,
        },
        {
            type: 'confirm',
            name: 'welcomeMessage',
            message: 'Enable welcome message for new group members?',
            default: true,
        },
    ]);

    const adminNumbers = [answers.ownerNumber];
    if (answers.adminNumbers) {
        answers.adminNumbers.split(',').map(n => n.trim()).filter(Boolean)
            .forEach(n => adminNumbers.push(n));
    }

    const targetGroups = (answers.targetGroups || '')
        .split(',').map(n => n.trim()).filter(Boolean);

    // Write .env file
    const envLines = [
        `OWNER_NUMBER=${answers.ownerNumber}`,
        `ADMIN_NUMBERS=${adminNumbers.join(',')}`,
    ];
    fs.writeFileSync('.env', envLines.join('\n') + '\n');

    // Patch config.js with the user's choices
    const configPath = path.join(__dirname, 'config.js');
    let src = fs.readFileSync(configPath, 'utf8');

    src = src.replace(/ownerNumber:.*,/, `ownerNumber: process.env.OWNER_NUMBER || '${answers.ownerNumber}',`);
    src = src.replace(/adminNumbers:.*,/, `adminNumbers: (process.env.ADMIN_NUMBERS || '${adminNumbers.join(',')}').split(','),`);

    if (answers.statusSchedule) {
        src = src.replace(/(statusUpdate[\s\S]*?schedule:\s*')[^']*'/, `$1${answers.statusSchedule}'`);
    }
    if (answers.groupSchedule) {
        src = src.replace(/(groupBroadcast[\s\S]*?schedule:\s*')[^']*'/, `$1${answers.groupSchedule}'`);
    }
    if (targetGroups.length) {
        src = src.replace(/targetGroups: \[\]/, `targetGroups: ${JSON.stringify(targetGroups)}`);
    }

    // Toggle booleans
    const toggle = (key, val) => {
        const re = new RegExp(`(${key}:[\\s\\S]*?enabled:\\s*)\\w+`);
        src = src.replace(re, `$1${val}`);
    };
    toggle('autoReply', answers.autoReply);
    toggle('statusUpdate', answers.statusUpdate);
    toggle('groupBroadcast', answers.groupBroadcast);
    toggle('welcomeMessage', answers.welcomeMessage);

    fs.writeFileSync(configPath, src);

    console.log(chalk.green('\n✅ Setup complete!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log('  1.  npm install');
    console.log('  2.  npm start');
    console.log('  3.  Scan the QR code with WhatsApp\n');
    console.log('Edit ' + chalk.cyan('src/config.js') + ' at any time to change messages, schedules, etc.\n');
}

main().catch(err => {
    console.error(chalk.red('Setup failed:'), err.message);
    process.exit(1);
});
