'use strict';

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

const LOG_DIR = path.join(__dirname, '..', 'logs');
fs.ensureDirSync(LOG_DIR);

function timestamp() {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}

function log(msg) {
    const line = `[${timestamp()}] INFO  ${msg}`;
    console.log('\x1b[36m' + line + '\x1b[0m');
    appendToFile(line);
}

function error(context, err) {
    const message = err instanceof Error ? err.message : String(err);
    const line = `[${timestamp()}] ERROR [${context}] ${message}`;
    console.error('\x1b[31m' + line + '\x1b[0m');
    appendToFile(line);
}

function appendToFile(line) {
    const file = path.join(LOG_DIR, `bot-${moment().format('YYYY-MM-DD')}.log`);
    fs.appendFile(file, line + '\n').catch(() => {});
}

module.exports = { log, error };
