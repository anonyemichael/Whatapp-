'use strict';

/**
 * MCP HTTP server — exposes bot controls as MCP tools over HTTP.
 * Mounted at /mcp on the same Express app as the REST API.
 */

const { Server } = require('@modelcontextprotocol/sdk/server');
const { StreamableHTTPServerTransport } = require('../node_modules/@modelcontextprotocol/sdk/dist/cjs/server/streamableHttp.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError,
} = require('@modelcontextprotocol/sdk/types.js');
const { randomUUID } = require('crypto');

const BOT_API = process.env.BOT_API_URL || 'http://localhost:3000';

async function call(method, path, body) {
    const url = `${BOT_API}${path}`;
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new McpError(ErrorCode.InternalError, data.error || `HTTP ${res.status}`);
    return data;
}

const TOOLS = [
    {
        name: 'blast_message',
        description: 'Send a marketing message to all WhatsApp groups (or specific ones)',
        inputSchema: {
            type: 'object',
            properties: {
                message: { type: 'string', description: 'The message to send' },
                targetGroups: { type: 'array', items: { type: 'string' }, description: 'Group name keywords to target. Empty = all groups.' },
            },
            required: ['message'],
        },
    },
    {
        name: 'send_dm',
        description: 'Send a direct WhatsApp message to a specific phone number',
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
        name: 'post_status',
        description: 'Post a text message as your WhatsApp status/story',
        inputSchema: {
            type: 'object',
            properties: {
                text: { type: 'string', description: 'The status text to post' },
            },
            required: ['text'],
        },
    },
    {
        name: 'list_groups',
        description: 'List all WhatsApp groups the bot is in',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'run_broadcast',
        description: 'Trigger the scheduled group broadcast immediately',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'run_status_update',
        description: 'Post the next scheduled status update now',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'run_dm_campaign',
        description: 'Trigger the DM campaign immediately',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'check_status',
        description: 'Check if the WhatsApp bot is connected and running',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'list_auto_replies',
        description: 'List all current keyword auto-reply rules',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'add_auto_reply',
        description: 'Add a new keyword auto-reply rule for the bot',
        inputSchema: {
            type: 'object',
            properties: {
                keyword: { type: 'string', description: 'Trigger keyword' },
                reply: { type: 'string', description: 'Reply message' },
            },
            required: ['keyword', 'reply'],
        },
    },
];

async function handleTool(name, args) {
    switch (name) {
        case 'blast_message': {
            const r = await call('POST', '/blast', { message: args.message, targetGroups: args.targetGroups || [] });
            return `✅ Blast done! Sent to ${r.sent}/${r.total} groups.\n\n${r.results.map(g => `• ${g.name}: ${g.status}`).join('\n')}`;
        }
        case 'send_dm': {
            await call('POST', '/dm', { number: args.number, message: args.message });
            return `✅ DM sent to +${args.number}`;
        }
        case 'post_status': {
            await call('POST', '/status/text', { text: args.text });
            return `✅ Status posted!`;
        }
        case 'list_groups': {
            const r = await call('GET', '/groups');
            return `📱 ${r.count} groups:\n\n${r.groups.map((g, i) => `${i + 1}. ${g.name}`).join('\n')}`;
        }
        case 'run_broadcast': {
            await call('POST', '/run/broadcast');
            return `✅ Group broadcast triggered!`;
        }
        case 'run_status_update': {
            await call('POST', '/run/status');
            return `✅ Status update posted!`;
        }
        case 'run_dm_campaign': {
            await call('POST', '/run/campaign');
            return `✅ DM campaign triggered!`;
        }
        case 'check_status': {
            const r = await call('GET', '/health');
            return `Bot: ${r.bot ? '🟢 Connected' : '🔴 Offline'}\nTime: ${r.time}`;
        }
        case 'list_auto_replies': {
            const r = await call('GET', '/autoreply');
            return `Auto-reply keywords:\n${r.rules.map(r => `• ${r.keyword}`).join('\n')}`;
        }
        case 'add_auto_reply': {
            await call('POST', '/autoreply/add', { keyword: args.keyword, reply: args.reply });
            return `✅ Auto-reply added for keyword: "${args.keyword}"`;
        }
        default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
}

// ─── SESSION MANAGEMENT ──────────────────────────────────────────────────────
const sessions = new Map();

function createMcpServer() {
    const server = new Server(
        { name: 'stayhub-whatsapp-bot', version: '1.0.0' },
        { capabilities: { tools: {} } }
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

    server.setRequestHandler(CallToolRequestSchema, async (req) => {
        const { name, arguments: args } = req.params;
        try {
            const text = await handleTool(name, args || {});
            return { content: [{ type: 'text', text }] };
        } catch (err) {
            if (err instanceof McpError) throw err;
            if (err?.cause?.code === 'ECONNREFUSED') {
                throw new McpError(ErrorCode.InternalError, `Bot API not reachable. Is the bot running?`);
            }
            throw new McpError(ErrorCode.InternalError, err.message);
        }
    });

    return server;
}

// ─── EXPRESS ROUTER ──────────────────────────────────────────────────────────
function createMcpRouter(express) {
    const router = express.Router();
    router.use(express.json());

    router.post('/', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'] || randomUUID();
        let transport = sessions.get(sessionId);

        if (!transport) {
            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => sessionId,
            });
            const server = createMcpServer();
            await server.connect(transport);
            sessions.set(sessionId, transport);
        }

        res.setHeader('mcp-session-id', sessionId);
        await transport.handleRequest(req, res, req.body);
    });

    router.get('/', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'];
        const transport = sessions.get(sessionId);
        if (!transport) {
            res.status(404).json({ error: 'No session found. POST first.' });
            return;
        }
        await transport.handleRequest(req, res);
    });

    router.delete('/', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'];
        const transport = sessions.get(sessionId);
        if (transport) {
            await transport.close();
            sessions.delete(sessionId);
        }
        res.status(200).json({ ok: true });
    });

    return router;
}

module.exports = { createMcpRouter };
