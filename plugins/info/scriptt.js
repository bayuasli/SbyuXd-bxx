/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "script",
  category: "info",
  command: ["infobot", "sc", "script"],
  
  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m) => {
    try {
      const owner = "628895307489";
      const prefix = ".";
      const botname = "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱";
      const ownername = "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱";
      const version = "2.0.0";
      
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeString = `${hours} jam ${minutes} menit ${seconds} detik`;
      
      const infoText = `
╭─「 *${botname} INFO* 」
│ • *Nama Bot* : ${botname}
│ • *Owner* : ${ownername}
│ • *Nomor Owner* : ${owner}
│ • *Prefix* : ${prefix}
│ • *Versi* : ${version}
│ • *Uptime* : ${uptimeString}
╰────

╭─「 *TECHNICAL INFO* 」
│ • *Platform* : ${process.platform}
│ • *Node.js* : ${process.version}
│ • *Memory* : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
│ • *Ping* : ${Date.now() - m.timestamp} ms
╰────

╭─「 *DEVELOPER INFO* 」
│ • *Developer Script* : AgusXzz
│ • *Repository* : https://api.github.com/repos/AgusXzz/ESEMPE-MD
│ • *Pengembang* : 𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱
│ • *Telegram* : t.me/bayuror
╰────`.trim();

      // Fake quoted pixx
      const fakeQuotedPixx = {
        key: {
          fromMe: false,
          participant: "0@s.whatsapp.net",
          ...(m.chat ? { remoteJid: "status@broadcast" } : {})
        },
        message: {
          interactiveMessage: {
            nativeFlowMessage: {
              buttons: [{
                name: "payment_info",
                buttonParamsJson: JSON.stringify({
                  payment_settings: [{
                    type: "pix_static_code",
                    pix_static_code: {
                      merchant_name: "bxx",
                      key: "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱",
                      key_type: "PHONE"
                    }
                  }]
                })
              }]
            }
          }
        }
      };

      await conn.relayMessage(m.chat, {
        extendedTextMessage: {
          text: infoText,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            quotedMessage: fakeQuotedPixx.message,
            participant: fakeQuotedPixx.key.participant,
            stanzaId: fakeQuotedPixx.key.id || 'BAE5C9E3C9A6C8D6'
          }
        }
      }, {});

    } catch (error) {
      console.error('[INFO ERROR]', error);
      m.reply('❌ Gagal menampilkan info bot');
    }
  }
};