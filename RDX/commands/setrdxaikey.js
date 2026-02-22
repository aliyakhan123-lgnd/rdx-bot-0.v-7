const fs = require('fs-extra');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../config.js');

module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'setrdxaikey',
    aliases: ['setaikey', 'configai'],
    description: 'Set RDX AI API key (ADMIN ONLY)',
    usage: 'setrdxaikey [API_KEY]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, args, send, config }) {
    const { senderID, threadID } = event;

    // Check if user is admin
    if (!config.ADMINBOT || !config.ADMINBOT.includes(senderID)) {
      return send.reply('❌ Only bot admins can use this command');
    }

    if (args.length === 0) {
      return send.reply(`Set RDX AI API Key

Usage: ${config.PREFIX}setrdxaikey [your_api_key]

Example: ${config.PREFIX}setrdxaikey csk-xxxxxxxxxxxxxxxxxxxxx

Current status: Check the rdxai.js file`);
    }

    const apiKey = args[0].trim();

    if (apiKey.length < 10) {
      return send.reply('❌ Invalid API Key - Key too short');
    }

    try {
      // Read the rdxai.js file
      const rdxaiPath = path.join(__dirname, 'rdxai.js');
      let content = await fs.readFile(rdxaiPath, 'utf-8');

      // Replace the API key in the API_KEYS array
      content = content.replace(
        /const API_KEYS = \[.*?\];/s,
        `const API_KEYS = ['${apiKey}'];`
      );

      // Write back the file
      await fs.writeFile(rdxaiPath, content, 'utf-8');

      // Also set environment variable for this session
      process.env.RDXAI_API_KEY = apiKey;

      return send.reply(`✅ RDX AI API Key configured successfully!

Your RDXAI command is now ready to use.
Test with: ${config.PREFIX}rdxai hello`);
    } catch (error) {
      console.error('Error setting API key:', error);
      return send.reply(`❌ Error: ${error.message}`);
    }
  }
};

