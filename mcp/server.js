#!/usr/bin/env node
'use strict';

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError,
} = require('@modelcontextprotocol/sdk/types.js');

const BOT_API = process.env.BOT_API_URL || 'http://localhost:3000';

// ─── HTTP HELPER ──────────────────────────────────────────────────────────────
async function call(method, path, body) {
    const url = `${BOT_API}${path}`;
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new McpError(ErrorCode.InternalError, data.error || `HTTP ${res.status}`);
    return data;
}

// ─── TOOL DEFINITIONS ─────────────────────────────────────────────────────────
const TOOLS = [
    {
        name: 'blast_message',
        description: 'Send a text marketing message to all WhatsApp groups (or specific ones). Use for announcements, promotions and StayHub updates.',
        inputSchema: {
            type: 'object',
            properties: {
                message: { type: 'string', description: 'The message to send to the groups' },
                targetGroups: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Optional list of group name keywords to target. Leave empty to send to ALL groups.',
                },
            },
            required: ['message'],
        },
    },
    {
        name: 'send_dm',
        description: 'Send a direct WhatsApp message to a specific phone number. Use for individual follow-ups or personal outreach.',
        inputSchema: {
            type: 'object',
            properties: {
                number: { type: 'string', description: 'Phone number in international format without + (e.g. 233533311532)' },
                message: { type: 'string', description: 'The message to send' },
            },
            required: ['number', 'message'],
        },
    },
    {
        name: 'post_status_text',
        description: 'Post a text message as your WhatsApp status/story. Visible to all your contacts. Great for daily StayHub promotions.',
        inputSchema: {
            type: 'object',
            properties: {
                text: { type: 'string', description: 'The status text to post (can include emojis and line breaks)' },
            },
            required: ['text'],
        },
    },
    {
        name: 'post_status_video',
        description: 'Post a video as your WhatsApp status/story. Provide the file path on the device running the bot.',
        inputSchema: {
            type: 'object',
            properties: {
                filePath: { type: 'string', description: 'Absolute file path to the video (e.g. /storage/emulated/0/promo.mp4)' },
                caption: { type: 'string', description: 'Optional caption for the video status' },
            },
            required: ['filePath'],
        },
    },
    {
        name: 'post_status_image',
        description: 'Post an image as your WhatsApp status/story. Provide the file path on the device running the bot.',
        inputSchema: {
            type: 'object',
            properties: {
                filePath: { type: 'string', description: 'Absolute file path to the image (e.g. /storage/emulated/0/banner.jpg)' },
                caption: { type: 'string', description: 'Optional caption for the image status' },
            },
            required: ['filePath'],
        },
    },
    {
        name: 'list_groups',
        description: 'List all WhatsApp groups the bot is currently in. Use this to see group names before targeting a specific blast.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'run_scheduled_status',
        description: 'Immediately post the next rotating scheduled status update (from the messages list in config). Useful to trigger manually.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'run_group_broadcast',
        description: 'Immediately run the scheduled group broadcast now — sends the next rotating message to all target groups.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'run_dm_campaign',
        description: 'Immediately run the DM campaign — sends the next rotating message to all contacts in the campaign list.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'add_auto_reply',
        description: 'Add a new keyword auto-reply rule. When someone DMs the bot with this keyword, it automatically replies.',
        inputSchema: {
            type: 'object',
            properties: {
                keyword: { type: 'string', description: 'The trigger keyword (e.g. "discount", "rooms", "available")' },
                reply: { type: 'string', description: 'The reply message to send when keyword is detected' },
            },
            required: ['keyword', 'reply'],
        },
    },
    {
        name: 'list_auto_replies',
        description: 'List all current auto-reply keyword triggers configured in the bot.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'check_bot_status',
        description: 'Check if the WhatsApp bot is running and connected.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
];

// ─── SERVER SETUP ─────────────────────────────────────────────────────────────
const server = new Server(
    { name: 'stayhub-whatsapp-bot', version: '1.0.0' },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        let result;

        switch (name) {
            case 'blast_message': {
                result = await call('POST', '/blast', { message: args.message, targetGroups: args.targetGroups || [] });
                return {
                    content: [{
                        type: 'text',
                        text: `✅ Blast complete!\nSent to ${result.sent}/${result.total} groups.\n\n${result.results.map(r => `• ${r.name}: ${r.status}`).join('\n')}`,
                    }],
                };
            }

            case 'send_dm': {
                result = await call('POST', '/dm', { number: args.number, message: args.message });
                return { content: [{ type: 'text', text: `✅ DM sent to +${args.number}` }] };
            }

            case 'post_status_text': {
                await call('POST', '/status/text', { text: args.text });
                return { content: [{ type: 'text', text: `✅ Status posted: "${args.text.slice(0, 60)}…"` }] };
            }

            case 'post_status_video': {
                await call('POST', '/status/video', { filePath: args.filePath, caption: args.caption || '' });
                return { content: [{ type: 'text', text: `✅ Video posted as WhatsApp status!` }] };
            }

            case 'post_status_image': {
                await call('POST', '/status/image', { filePath: args.filePath, caption: args.caption || '' });
                return { content: [{ type: 'text', text: `✅ Image posted as WhatsApp status!` }] };
            }

            case 'list_groups': {
                result = await call('GET', '/groups');
                const list = result.groups.map((g, i) => `${i + 1}. ${g.name}`).join('\n');
                return { content: [{ type: 'text', text: `📱 *${result.count} Groups:*\n\n${list || 'No groups found'}` }] };
            }

            case 'run_scheduled_status': {
                await call('POST', '/run/status');
                return { content: [{ type: 'text', text: `✅ Scheduled status posted!` }] };
            }

            case 'run_group_broadcast': {
                await call('POST', '/run/broadcast');
                return { content: [{ type: 'text', text: `✅ Group broadcast triggered!` }] };
            }

            case 'run_dm_campaign': {
                await call('POST', '/run/campaign');
                return { content: [{ type: 'text', text: `✅ DM campaign triggered!` }] };
            }

            case 'add_auto_reply': {
                await call('POST', '/autoreply/add', { keyword: args.keyword, reply: args.reply });
                return { content: [{ type: 'text', text: `✅ Auto-reply added!\nKeyword: "${args.keyword}"\nReply: "${args.reply.slice(0, 80)}…"` }] };
            }

            case 'list_auto_replies': {
                result = await call('GET', '/autoreply');
                const keywords = result.rules.map(r => `• ${r.keyword}`).join('\n');
                return { content: [{ type: 'text', text: `🔁 Auto-reply keywords:\n\n${keywords}` }] };
            }

            case 'check_bot_status': {
                result = await call('GET', '/health');
                const status = result.bot ? '🟢 Connected & running' : '🔴 Not connected';
                return { content: [{ type: 'text', text: `Bot status: ${status}\nTime: ${result.time}` }] };
            }

            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    } catch (err) {
        if (err instanceof McpError) throw err;
        if (err.cause?.code === 'ECONNREFUSED') {
            throw new McpError(ErrorCode.InternalError, `Bot API not reachable at ${BOT_API}. Is the bot running? (npm start)`);
        }
        throw new McpError(ErrorCode.InternalError, err.message);
    }
});

// ─── START ────────────────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[MCP] StayHub WhatsApp MCP server running');
}

main().catch(err => {
    console.error('[MCP] Fatal:', err);
    process.exit(1);
});
