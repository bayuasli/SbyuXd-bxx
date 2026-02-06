/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "gcsw",
  category: "owner",
  command: ["gcsw", "swgc", "toswgc"],
  
  settings: {
    owner: true,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m, context) => {
    try {
      const text = m.text || "";
      conn._gcsw = conn._gcsw || {};

      // Phase 2: Send to selected group
      if (text && /^\d+$/.test(text.trim())) {
        const userData = conn._gcsw[m.sender];
        if (!userData) {
          return m.reply('❌ Belum ada konten yang disiapkan. Kirim teks atau reply media dulu pakai .gcsw');
        }

        const index = parseInt(text.trim()) - 1;
        const groups = userData.groups;
        if (!groups[index]) {
          return m.reply('❌ Nomor grup tidak valid.');
        }

        const targetGroup = groups[index];
        const content = userData.content;
        
        m.reply(`⏳ Mengirim status grup ke ${targetGroup.subject}...`);

        // Import baileys functions
        const { generateWAMessageContent, generateWAMessageFromContent } = await import('@whiskeysockets/baileys');
        const crypto = await import('crypto');

        const messageSecret = crypto.randomBytes(32);
        
        // SOLUSI: Upload media terpisah sebelum generate message
        let uploadedContent = content;
        
        if (content.image || content.video) {
          try {
            // Upload media ke server WhatsApp terlebih dahulu
            const mediaType = content.image ? 'image' : 'video';
            const mediaBuffer = content.image || content.video;
            const mimetype = content.mimetype;
            
            // Upload dengan retry logic
            let uploadResult;
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
              try {
                uploadResult = await conn.waUploadToServer(
                  mediaBuffer,
                  {
                    mediaType: mediaType,
                    fileEncSha256: crypto.createHash('sha256').update(mediaBuffer).digest('hex'),
                    timeout: 30000
                  }
                );
                break; // Berhasil, keluar loop
              } catch (uploadError) {
                retryCount++;
                console.error(`Upload attempt ${retryCount} failed:`, uploadError);
                if (retryCount === maxRetries) throw uploadError;
                await new Promise(resolve => setTimeout(resolve, 2000)); // Tunggu 2 detik
              }
            }
            
            // Update content dengan URL upload
            if (uploadResult && uploadResult.url) {
              uploadedContent = {
                [mediaType]: {
                  url: uploadResult.url,
                  mimetype: mimetype,
                  caption: content.caption || '',
                  fileSha256: uploadResult.fileSha256,
                  fileEncSha256: uploadResult.fileEncSha256,
                  mediaKey: uploadResult.mediaKey,
                  directPath: uploadResult.directPath
                }
              };
            }
          } catch (uploadError) {
            console.error('[MEDIA UPLOAD ERROR]', uploadError);
            throw new Error('Gagal upload media ke server WhatsApp');
          }
        }
        
        // Generate message content dengan media yang sudah di-upload
        const inside = await generateWAMessageContent(uploadedContent, { 
          upload: conn.waUploadToServer 
        });
        
        // Create group status message
        const msg = generateWAMessageFromContent(
          targetGroup.id,
          {
            messageContextInfo: { 
              messageSecret: messageSecret 
            },
            groupStatusMessageV2: { 
              message: { 
                ...inside, 
                messageContextInfo: { 
                  messageSecret: messageSecret 
                } 
              } 
            },
          },
          {}
        );

        // Send to group
        await conn.relayMessage(targetGroup.id, msg.message, { 
          messageId: msg.key.id 
        });

        delete conn._gcsw[m.sender];
        return m.reply(`✅ Status grup terkirim ke:\n${targetGroup.subject}`);
      }

      // Phase 1: Prepare content
      const quoted = m.isQuoted ? m.quoted : m;
      const mime = (quoted.msg || quoted).mimetype || '';
      const teks = text || quoted.text || quoted.caption;

      if (!/image|video/.test(mime) && !teks) {
        return m.reply('❌ Kirim teks atau reply media dulu.');
      }

      let content;
      if (/image|video/.test(mime)) {
        const type = mime.split('/')[0]; // 'image' or 'video'
        const media = await conn.downloadMediaMessage(quoted);
        if (!media) {
          return m.reply('❌ Gagal mengambil media.');
        }
        
        // Validasi ukuran media (max 16MB untuk WhatsApp)
        const maxSize = 16 * 1024 * 1024; // 16MB
        if (media.length > maxSize) {
          return m.reply(`❌ Media terlalu besar (${(media.length / 1024 / 1024).toFixed(2)}MB). Maksimal 16MB.`);
        }
        
        content = {
          [type]: media,
          caption: teks || '',
          mimetype: mime
        };
      } else {
        content = {
          text: teks,
          backgroundColor: '#0068ff'
        };
      }

      // Get all groups
      const groupsData = await conn.groupFetchAllParticipating();
      const groups = Object.entries(groupsData).map(([id, groupData]) => ({
        id,
        subject: groupData.subject || 'Unknown Group',
        participants: groupData.participants || []
      }));

      if (!groups.length) {
        return m.reply('❌ Bot belum ada di grup manapun.');
      }

      let list = '📋 *Pilih grup tujuan SW:*\n\n';
      groups.forEach((g, i) => {
        const memberCount = g.participants.length;
        list += `${i + 1}. ${g.subject} (${memberCount} member)\n`;
      });
      
      list += '\n📍 *Ketik:* .gcsw <nomor>\nContoh: `.gcsw 1`';

      conn._gcsw[m.sender] = { content, groups };
      m.reply(list);

    } catch (error) {
      console.error('[GCSW ERROR]', error);
      let errorMessage = `❌ Error: ${error.message}`;
      
      if (error.message.includes('upload') || error.message.includes('Media upload failed')) {
        errorMessage = '❌ Gagal upload media ke server WhatsApp. Coba dengan media yang lebih kecil atau coba lagi nanti.';
      } else if (error.message.includes('timeout')) {
        errorMessage = '❌ Timeout saat upload media. Koneksi lambat, coba lagi nanti.';
      } else if (error.message.includes('groupStatusMessageV2')) {
        errorMessage = '❌ Fitur status grup tidak support. Bot mungkin perlu update Baileys versi terbaru.';
      }
      
      m.reply(errorMessage);
    }
  }
};