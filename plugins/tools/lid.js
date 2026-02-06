/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "lid",
  category: "tools",
  command: ["lid"],

  settings: { loading: true },

  run: async (conn, m) => {
    try {
      let target

      if (m.quoted) target = m.quoted.sender
      else if (m.mentionedJid?.length) target = m.mentionedJid[0]
      else target = m.sender

      const number = target.split('@')[0]

      const data = await conn.onWhatsApp(number)

      if (!data || !data.length)
        return m.reply("❌ User tidak ditemukan di WhatsApp")

      const lid = data[0]?.lid || "Tidak tersedia"

      m.reply(`🆔 LID dari @${number}\n\n📩 LID: ${lid}`, {
        mentions: [target]
      })

    } catch (e) {
      m.reply("❌ Gagal mengambil LID")
      console.error(e)
    }
  }
}