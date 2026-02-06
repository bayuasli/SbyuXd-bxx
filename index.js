import './lib/database.js'
import('./config.js')
import makeWASocket, {
  Browsers,
  DisconnectReason,
  delay,
  fetchLatestBaileysVersion
} from 'baileys';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import pino from 'pino';
import serialize, { Client } from '#lib/serialize.js';
import log from '#lib/logger.js';
import PluginsLoad from '#lib/loadPlugins.js';
import useSqliteAuth from '#lib/baileysAuth.js'; 

const loader = new PluginsLoad('./plugins', { debug: true });
await loader.load();
global.plugins = loader.plugins;

async function startWA() {
  
  const { state, saveCreds } = await useSqliteAuth('sessions');
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    auth: state, 
    version,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Edge'),
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true
  });

  await Client(conn);
  conn.chats ??= {};

  if (!conn.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await conn.requestPairingCode(PAIRING_NUMBER, 'SIBAYUXD');
        log.info(`Pairing Code: ${code}`);
      } catch (err) {
        log.error(`Gagal ambil pairing code: ${err}`);
      }
    }, 3000);
  }

  conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection) log.info(`Connection Status: ${connection}`);
    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      switch (statusCode) {
        case 408:
        case 503:
        case 428:
        case 515:
          log.error('Connection issue. Restarting...');
          await startWA();
          break;
        case 401:
        case 403:
        case 405:
          log.error('Session invalid. Recreating...');
          fs.rmSync('./sessions', { recursive: true, force: true });
          await startWA();
          break;
        default:
          log.error(`Unhandled issue. Code: ${statusCode}`);
          await startWA();
      }
    }
    if (connection === 'open') {
      log.success('Bot connected successfully.');
      conn.chats = await conn.groupFetchAllParticipating();
    }
  });

  
  conn.ev.on('creds.update', saveCreds);

  conn.ev.on('groups.update', (updates) => {
    for (const update of updates) {
      const id = update.id;
      if (conn.chats[id]) {
        conn.chats[id] = {
          ...(conn.chats[id] || {}),
          ...(update || {})
        };
      }
    }
  });

  conn.ev.on('group-participants.update', ({ id, participants, action }) => {
    const metadata = conn.chats[id];
    if (metadata) {
      switch (action) {
        case 'add':
        case 'revoked_membership_requests':
          participants.map(p => metadata.participants.push(p));
          break;
        case 'demote':
        case 'promote':
          for (const p of participants) {
            const target = metadata.participants.find(x => x.id === p.id);
            if (target) target.admin = action === 'promote' ? 'admin' : null;
          }
          break;
        case 'remove':
          metadata.participants = metadata.participants.filter(p => !participants.includes(p.id));
          break;
      }
    }
  });

  conn.ev.on('messages.upsert', async ({ messages }) => {
    if (!messages[0]) return;
    conn.messages ??= new Map();
    const m = await serialize(conn, messages[0]);
    if (!conn.messages.has(m.chat)) conn.messages.set(m.chat, []);
    conn.messages.get(m.chat).push(m);

    if (m.key && !m.fromMe && m.key.remoteJid === 'status@broadcast') {
      if (!readsw.active) return;
      if (m.type === 'protocolMessage' && m.message.protocolMessage.type === 0) return;
      try {
        await conn.readMessages([m.key]);
        if (!readsw.react) {
          const emojis = readsw.emoji;
          const emoji = emojis[Math.floor(Math.random() * emojis.length)] || '💚';
          await delay(10000);
          await conn.sendMessage(
            'status@broadcast',
            { react: { text: emoji, key: m.key } },
            { statusJidList: [m.key.participant] }
          );
        }
        console.log(`Dibaca Story dari ${m.key.participant.split('@')[0]}`);
      } catch (err) {
        console.error(err);
      }
    }

    if (m.chat.endsWith('@broadcast') || m.chat.endsWith('@newsletter')) return;
    if (m.message && !m.isBot) {
      if (m.type === 'protocolMessage') return;
      await (await import(`#lib/print.js?v=${Date.now()}`)).default(conn, m);
    }

    await (await import(`./handler.js?v=${Date.now()}`)).default(conn, m);
  });
}

startWA();