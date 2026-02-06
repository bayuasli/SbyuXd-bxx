/** @type {import('#lib/types.js').Plugin} */
import axios from "axios"

export default {
  name: "getjson",
  category: "tools",
  command: ["gjson", "getjson"],

  settings: { loading: true },

  run: async (conn, m) => {

    const text = m.body.replace(m.prefix + m.command, '').trim()

    if (!text)
      return m.reply("Masukkan URL!\nContoh: .gjson https://api.example.com/data")

    try {
      const res = await axios.get(text)
      const data = res.data

      if (typeof data !== "object")
        return m.reply("❌ Response bukan JSON")

      const formatted = JSON.stringify(data, null, 2)

      if (formatted.length > 4000) {
        await conn.sendMessage(m.chat, {
          document: Buffer.from(formatted),
          mimetype: "application/json",
          fileName: "response.json"
        }, { quoted: m })
      } else {
        m.reply("```json\n" + formatted + "\n```")
      }

    } catch (e) {
      m.reply("❌ Error: " + e.message)
    }
  }
}