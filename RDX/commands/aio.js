const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "aio",
        aliases: ["down", "download", "dl"],
        version: "1.0.0",
        permission: 0,
        prefix: true,
        premium: false,
        category: "media",
        credits: "SARDAR RDX",
        description: "All-In-One Downloader for TikTok, FB, IG, etc.",
        usages: ".aio [url]",
        cooldowns: 5
    },

    run: async function ({ api, event, args }) {
        const url = args[0];

        if (!url) {
            return api.sendMessage("❌ Please provide a valid URL (TikTok, FB, IG, etc.)", event.threadID, event.messageID);
        }

        const frames = [
            "⌛ Processing URL... 15%",
            "📥 Fetching Link... 40%",
            "🚀 Downloading File... 65%",
            "🎬 Processing Video... 90%",
            "✅ Task Completed! 100%"
        ];

        const statusMsg = await api.sendMessage(`🌀 **AIO DOWNLOADER**\n\n${frames[0]}`, event.threadID);

        try {
            // Step 1: Fetch Download Info from API
            const apiUrl = `https://anabot.my.id/api/download/aio?url=${encodeURIComponent(url)}&apikey=freeApikey`;

            await api.editMessage(`🌀 **AIO DOWNLOADER**\n\n${frames[1]}`, statusMsg.messageID);

            const response = await axios.get(apiUrl, { timeout: 60000 });
            const result = response.data;

            if (!result.success || !result.data || !result.data.result) {
                api.unsendMessage(statusMsg.messageID);
                return api.sendMessage("❌ Error: Failed to fetch download data. Link invalid ya server down hy.", event.threadID, event.messageID);
            }

            const data = result.data.result;
            if (!data || !data.links) {
                api.unsendMessage(statusMsg.messageID);
                return api.sendMessage("❌ Error: API response mein links mojud nahi hain.", event.threadID, event.messageID);
            }

            const title = data.title || "RDX AIO Download";
            const source = data.source || "Unknown";

            // Find the best mp4 link
            const videoLink = (data.links.find(l => l && l.type === 'mp4' && !l.mute) || data.links[0])?.url;

            if (!videoLink) {
                api.unsendMessage(statusMsg.messageID);
                return api.sendMessage("❌ No downloadable video found for this link.", event.threadID, event.messageID);
            }

            await api.editMessage(`🌀 **AIO DOWNLOADER**\n\n${frames[2]}`, statusMsg.messageID);

            // Step 2: Download the actual file to cache
            const cacheDir = path.join(__dirname, "cache");
            await fs.ensureDir(cacheDir);
            const filePath = path.join(cacheDir, `rdx_aio_${Date.now()}.mp4`);

            const fileStream = await axios({
                method: 'get',
                url: videoLink,
                responseType: 'arraybuffer',
                timeout: 300000 // 5 mins
            });

            await api.editMessage(`🌀 **AIO DOWNLOADER**\n\n${frames[3]}`, statusMsg.messageID);

            fs.writeFileSync(filePath, Buffer.from(fileStream.data));

            await api.editMessage(`🌀 **AIO DOWNLOADER**\n\n${frames[4]}`, statusMsg.messageID);

            // Step 3: Send file and Cleanup
            await api.sendMessage({
                body: `📥 **AIO DOWNLOAD SUCCESS**\n\n📝 **Title:** ${title}\n🌐 **Source:** ${source.toUpperCase()}\n\n🔹 **Powered by SARDAR RDX**`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID);

            // Small delay before unsending status and deleting file
            setTimeout(() => {
                try {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    api.unsendMessage(statusMsg.messageID);
                } catch (e) {
                    console.log("AIO Cleanup Error:", e.name);
                }
            }, 5000);

        } catch (error) {
            console.error("AIO Command Error:", error.message);
            api.unsendMessage(statusMsg.messageID);
            return api.sendMessage(`❌ Maafi! Download nahi ho saka.\nError: ${error.message}`, event.threadID, event.messageID);
        }
    }
};
