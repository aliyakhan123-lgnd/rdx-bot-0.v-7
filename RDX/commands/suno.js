const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const BASE_URL = 'https://kojaxd-api.vercel.app/ai/sunoai';
const API_KEY = ''; // User can add their API key here

module.exports = {
  config: {
    name: 'suno',
    aliases: ['sing', 'song', 'music'],
    description: "Generate AI songs based on your lyrics.",
    credits: "SARDAR RDX",
    usage: 'suno [prompt] | [style] | [title]',
    category: 'Media',
    prefix: true
  },

  async run({ api, event, args, send, client, config }) {
    const { threadID, messageID, senderID } = event;

    if (!args[0]) {
      return send.reply('⚠️ Please provide a prompt. Usage: .suno [prompt] | [style] | [title]');
    }

    const input = args.join(' ');
    const parts = input.split('|').map(p => p.trim());

    const prompt = parts[0];
    const style = parts[1] || 'Rock';
    const title = parts[2] || 'Sardar RDX Song';

    try {
      api.setMessageReaction("🎼", messageID, () => { }, true);
      const waitMsg = await send.reply('🎼 𝐂𝐫𝐞𝐚𝐭𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐬𝐨𝐧𝐠... 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭, 𝐭𝐡𝐢𝐬 𝐭𝐚𝐤𝐞𝐬 𝐚𝐛𝐨𝐮𝐭 𝟐-𝟑 𝐦𝐢𝐧𝐮𝐭𝐞𝐬. ⏳');

      const taskId = await createTask(prompt, style, title);
      console.log('Suno Task Created:', taskId);

      let audioUrl = null;
      let attempts = 0;
      const MAX_ATTEMPTS = 40; // 40 * 10s = ~6 minutes max

      while (!audioUrl && attempts < MAX_ATTEMPTS) {
        attempts++;
        const result = await checkTaskStatus(taskId);

        // The API returns result as an array, check for audioUrl in the first element
        if (result && Array.isArray(result) && result[0]?.data?.data?.length > 0) {
          audioUrl = result[0].data.data[0].audioUrl;
        }

        if (!audioUrl) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        }
      }

      if (!audioUrl) {
        return api.sendMessage('❌ 𝐒𝐨𝐧𝐠 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐨𝐧 𝐭𝐢𝐦𝐞𝐝 𝐨𝐮𝐭. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.', threadID, messageID);
      }

      const cacheDir = path.join(__dirname, 'cache');
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `suno_${Date.now()}.mp3`);

      const response = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 30000 });
      await fs.writeFile(filePath, Buffer.from(response.data));

      api.setMessageReaction("✅", messageID, () => { }, true);

      await api.sendMessage({
        body: `✅ 𝐘𝐨𝐮𝐫 𝐀𝐈 𝐒𝐨𝐧𝐠 𝐢𝐬 𝐑𝐞𝐚𝐝𝐲!\n\n🎵 𝐓𝐢𝐭𝐥𝐞: ${title}\n🎸 𝐒𝐭𝐲𝐥𝐞: ${style}\n👤 𝐎𝐰𝐧𝐞𝐫: SARDAR RDX`,
        attachment: fs.createReadStream(filePath)
      }, threadID, messageID);

      // Clean up after sending
      setTimeout(() => {
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) { }
      }, 5000);

    } catch (error) {
      console.error('Suno Error:', error.message);
      api.setMessageReaction("❌", messageID, () => { }, true);
      return send.reply(`❌ 𝐄𝐫𝐫𝐨𝐫: ${error.message}`);
    }
  }
};

async function createTask(prompt, style, title) {
  const url = `${BASE_URL}?apikey=${API_KEY}&action=create&prompt=${encodeURIComponent(prompt)}&style=${encodeURIComponent(style)}&title=${encodeURIComponent(title)}`;
  const response = await axios.get(url, { timeout: 15000 });
  if (response.data.status) {
    return response.data.task_id;
  }
  throw new Error(response.data.message || 'Failed to create task');
}

async function checkTaskStatus(taskId) {
  const url = `${BASE_URL}?apikey=${API_KEY}&action=status&task_id=${taskId}`;
  const response = await axios.get(url, { timeout: 15000 });
  if (response.data.status) {
    return response.data.result;
  }
  return null;
}
