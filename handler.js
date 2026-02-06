import axios from 'axios'
import { jidNormalizedUser } from 'baileys'
import util from 'util'
import cp from 'child_process'
import Api from '#lib/api.js'
import Func from '#lib/function.js'

/* ================= SYSTEM CORE ================= */

const MSG_QUEUE = []
let PROCESSING = false
const RATE = new Map()

function queuePush(job) {
  MSG_QUEUE.push(job)
  runQueue()
}

async function runQueue() {
  if (PROCESSING || !MSG_QUEUE.length) return
  PROCESSING = true
  const job = MSG_QUEUE.shift()
  try { await job() } catch (e) { console.error(e) }
  PROCESSING = false
  runQueue()
}

function isLimited(id, delay = 1200) {
  if (RATE.has(id)) return true
  RATE.set(id, 1)
  setTimeout(() => RATE.delete(id), delay)
  return false
}

setInterval(() => {
  if (global.gc) global.gc()
}, 300000)

/* ================= HANDLER ================= */

async function core(conn, m) {
  if (m.isBot) return
  if (isLimited(m.sender)) return
  if (!IS_PUBLIC && !m.fromMe && !ownerNumber.includes(m.sender.split('@')[0])) return

  const quoted = m.isQuoted ? m.quoted : m
  const downloadM = async (filename) => await conn.downloadMediaMessage(quoted, filename)
  const isCommand = (m.prefix && m.body.startsWith(m.prefix)) || false
  const isOwner = m.fromMe || ownerNumber.includes(m.sender.split('@')[0])

  const metadata = m.isGroup ? conn.chats[m.chat] || (await conn.groupMetadata(m.chat).catch(() => null)) : {}
  const Admin = m.isGroup && metadata.participants?.find(u => conn.getJid(u.id) === m.sender)
  const isAdmin = Admin?.admin === 'superadmin' || Admin?.admin === 'admin' || false
  const isBotAdmin = m.isGroup && metadata.participants?.find(u => conn.getJid(u.id) === jidNormalizedUser(conn.user.id))?.admin || false

  const ctx = { Api, Func, downloadM, quoted, metadata, isOwner, isAdmin, isBotAdmin }

  for (const plugin of Object.values(plugins)) {

    if (typeof plugin.on === 'function') {
      try {
        const handled = await plugin.on.call(conn, m, ctx)
        if (handled) continue
      } catch (e) {
        console.error(`[PLUGIN EVENT ERROR] ${plugin.name}`, e)
      }
    }

    if (isCommand) {
      const command = m.command?.toLowerCase()
      const isCmd = plugin?.command?.includes(command) || plugin?.alias?.includes(command)

      if (!isCmd) continue

      try {
        if (plugin.settings?.owner && !isOwner) return m.reply(mess.owner)
        if (plugin.settings?.private && m.isGroup) return m.reply(mess.private)
        if (plugin.settings?.group && !m.isGroup) return m.reply(mess.group)
        if (plugin.settings?.admin && !isAdmin) return m.reply(mess.admin)
        if (plugin.settings?.botAdmin && !isBotAdmin) return m.reply(mess.botAdmin)
        if (plugin.settings?.loading) m.reply(mess.wait)

        await plugin.run(conn, m, ctx)

      } catch (e) {
        console.error(`[PLUGIN ERROR] ${plugin.name}`, e)
        await m.reply('Terjadi error saat menjalankan command.')
      }
    }
  }

  if (['>', '=>', '~>'].some(a => m.body?.toLowerCase().startsWith(a)) && isOwner) {
    let evalCmd = ''
    try {
      evalCmd = /await/i.test(m.text)
        ? eval(`(async() => { ${m.text} })()`)
        : eval(m.text)
    } catch (e) { evalCmd = e }

    Promise.resolve(evalCmd)
      .then(res => m.reply(util.format(res)))
      .catch(err => m.reply(util.format(err)))
  }

  if (m.body?.startsWith('$') && isOwner) {
    const exec = util.promisify(cp.exec).bind(cp)
    let o
    try { o = await exec(m.text) } catch (e) { o = e }
    const { stdout, stderr } = o
    if (stdout?.trim()) m.reply(stdout)
    if (stderr?.trim()) m.reply(stderr)
  }
}

/* ============== EXPORT WRAPPED QUEUE ============== */

export default function handler(conn, m) {
  queuePush(() => core(conn, m))
}