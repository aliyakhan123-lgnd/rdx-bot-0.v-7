const stringSimilarity = require('string-similarity');
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ═══════════════════════════════════════════════════════════════
// RDX AI HELPER - AI-Powered Bot Guide & Error Detector
// Works with PREFIX: .rdxai [question]
// Works WITHOUT PREFIX: Just type "rdxai [question]"
// Guides users about commands, coins, bank, and bot features
// ═══════════════════════════════════════════════════════════════

// --- DYNAMIC COMMAND LOADER ---
function getCommandsInfo() {
  const commands = [];
  if (global.client && global.client.commands) {
    for (const [name, command] of global.client.commands) {
      if (command.config) {
        commands.push({
          name: command.config.name,
          description: command.config.description,
          usage: command.config.usage || name,
          aliases: command.config.aliases || [],
          category: command.config.category || 'General'
        });
      }
    }
  }
  return commands;
}

function getSystemPrompt() {
  const allCmds = getCommandsInfo();
  const cmdListStr = allCmds.map(c => `- ${c.name}: ${c.description} (Usage: ${c.usage})`).join('\n');

  return `Aap RDXAI hain - SARDAR RDX ke banaye hue specialized Helping Assistant. 
Aapka maqsad sirf aur sirf users ko RDX Bot ke bare mein guide karna aur unki help karna hai. 

**KNOWLEDGE BASE (RDX BOT COMMANDS):**
${cmdListStr}

**CRITICAL RULE:** 
1. Aap hamesha **RDX Bot** ke context mein hi jawab dena hai. 
2. Agar koi kisi command ke bare mein pooche, to upar di gayi list se **ACCURATE** information dein. Man-ghadat (fake) commands ya details na batayein.
3. Agar koi command list mein nahi hai, to kahein ke "Ye command filhaal bot mein mojud nahi hy."

**OWNER INFO:**
✓ Creator: SARDAR RDX
✓ Bot Name: RDX Bot (Elite V7)
✓ Assistant: RDXAI

**PERSONALITY:**
- Hinglish (Urdu/Hindi + English mix).
- Friendly, respectful aur natural tone.
- Short & Helpful (max 3-4 lines).
- Har sawal ka jawab bot ki promotion aur help ke liye dein.`;
}


// --- AI CONFIGURATION ---
const API_KEYS = [
  'csk-vd9ywcn55vh6yn88h8m5wee93dp9ccxmxrnd99jttxjt9938',
  'csk-ndtww2mknrhttp868w92hv443j48jf442j3h86kkyw5jhdxn'
];
const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';
const HISTORY_FILE = path.join(__dirname, "cache", "rdxai_history.json");
const MODEL_NAME = "llama3.1-8b";

function getRandomApiKey() {
  if (API_KEYS.length === 0) return null;
  return API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
}

function ensureHistoryFile() {
  const dir = path.dirname(HISTORY_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, JSON.stringify({}), 'utf8');
}

function getUserHistory(userID) {
  ensureHistoryFile();
  try {
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    return Array.isArray(data[userID]) ? data[userID].slice(-10) : [];
  } catch { return []; }
}

function saveUserHistory(userID, messages) {
  try {
    ensureHistoryFile();
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    data[userID] = messages.slice(-12);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data), 'utf8');
  } catch (err) { }
}

async function getAIResponse(userID, prompt) {
  const history = getUserHistory(userID);
  const messages = [
    { role: "system", content: getSystemPrompt() },
    ...history,
    { role: "user", content: prompt }
  ];

  try {
    const apiKey = getRandomApiKey();
    if (!apiKey) throw new Error("API Key not found");

    console.log(`[RDXAI] Using API Key: ${apiKey.substring(0, 10)}...`);
    console.log(`[RDXAI] Model: ${MODEL_NAME}`);

    const response = await axios.post(CEREBRAS_API_URL, {
      model: MODEL_NAME,
      messages: messages,
      temperature: 0.7,
      max_completion_tokens: 350,
      top_p: 0.9
    }, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 15000
    });

    const botReply = response.data.choices[0].message.content;
    saveUserHistory(userID, [...history, { role: "user", content: prompt }, { role: "assistant", content: botReply }]);
    return botReply;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

function formatCommandGuide(cmd, prefix = '.') {
  let text = `✅ **${prefix}${cmd.name.toUpperCase()}**\n`;

  // Format command name nicely (openaccount -> Open Account)
  const niceName = cmd.name
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  text = `✅ **Command: ${niceName}**\n`;
  text += `📝 ${cmd.description}\n`;
  text += `📌 Usage: \`${prefix}${cmd.usage}\`\n`;
  text += `🏷️ Category: ${cmd.category}\n`;
  if (cmd.coins && cmd.coins !== 0) {
    text += `💰 Cost: ${cmd.coins} coins\n`;
  }
  if (cmd.aliases && cmd.aliases.length > 0) {
    text += `⚡ Aliases: ${cmd.aliases.map(a => '`' + prefix + a + '`').join(', ')}\n`;
  }
  return text;
}

function generateOwnerCard() {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃    👑 BOT INFORMATION    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━┛

🤖 Bot Name: RDXAI
👨‍💼 Creator: SARDAR RDX
🤖 Assistant: RDXAI
✅ Status: ACTIVE

📊 Features:
✓ Smart Command Guide
✓ Problem Solver
✓ Coin Helper
✓ 24/7 Support

💬 Need Help?
DM SARDAR RDX

════════════════════════`;
}

const GUIDES = {
  bank: `🏦 **BANK ACCOUNT SETUP GUIDE**
1. Command: .openaccount [full_name]
2. Command: .deposit [amount]
3. Command: .mybank (Check details)`,
  admin: `🛡️ **RDX ADMIN TOOLS**
- .kick, .ban, .mute, .unmute
- .prefix, .convo, .approve
Note: Admin commands only work for authorized users.`,
  owner: `👑 **DEVELOPER INFO**
Bot Creator: SARDAR RDX
Assistant: RDXAI
For bugs or features, contact the owner.`,
  paymentinfo: `💳 **PRICING INFO**
Commands like .pair, .marry, and .bestfriend require coins.
Check your balance with .balance.`
};

function detectCommandQuery(message) {
  if (!message) return null;
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('owner') || lowerMsg.includes('creator') || lowerMsg.includes('sardar') || lowerMsg.includes('rdx')) {
    return { type: 'guide', guide: 'owner' };
  }

  if (lowerMsg.includes('bank') || lowerMsg.includes('account')) {
    return { type: 'guide', guide: 'bank' };
  }

  if (global.client && global.client.commands) {
    for (const [name, cmd] of global.client.commands) {
      if (cmd && cmd.config && cmd.config.name) {
        const cmdName = cmd.config.name.toLowerCase();
        const aliases = cmd.config.aliases || [];
        const isMentioned = lowerMsg.includes(cmdName) ||
          aliases.some(a => lowerMsg.includes(a.toLowerCase()));

        if (isMentioned && (lowerMsg.includes('how') || lowerMsg.includes('use') || lowerMsg.includes('kya'))) {
          return { type: 'command', command: cmd.config };
        }
      }
    }
  }
  return null;
}

function detectWrongCommand(message, prefix = '.') {
  if (!message) return null;
  const firstWord = message.toLowerCase().split(/\s+/)[0];
  if (!firstWord || !firstWord.startsWith(prefix.toLowerCase())) return null;

  const cmdName = firstWord.replace(prefix.toLowerCase(), '').trim();
  if (!cmdName || !global.client || !global.client.commands) return null;

  if (global.client.commands.has(cmdName)) return null;

  const allCmdNames = [];
  for (const [name, cmd] of global.client.commands) {
    if (cmd && cmd.config && cmd.config.name) {
      allCmdNames.push(cmd.config.name.toLowerCase());
      if (cmd.config.aliases) {
        cmd.config.aliases.forEach(a => allCmdNames.push(a.toLowerCase()));
      }
    }
  }

  if (allCmdNames.length === 0) return null;

  const result = stringSimilarity.findBestMatch(cmdName, allCmdNames);
  if (result && result.bestMatch && result.bestMatch.rating > 0.6) {
    const target = result.bestMatch.target;
    let foundCmd = global.client.commands.get(target);
    if (!foundCmd) {
      for (const [name, cmd] of global.client.commands) {
        if (cmd && cmd.config && cmd.config.aliases && cmd.config.aliases.some(a => a.toLowerCase() === target)) {
          foundCmd = cmd;
          break;
        }
      }
    }
    return { wrongCommand: cmdName, correctCommand: foundCmd?.config };
  }
  return null;
}

module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'rdxai',
    aliases: ['ai', 'helper'],
    description: 'RDX AI Helper - AI Chat Assistant',
    usage: 'rdxai [question]',
    category: 'Utility',
    prefix: false
  },

  async run({ api, event, args, send, config }) {
    const { threadID, senderID, messageID, body } = event;

    // Get user message from args (already parsed by command handler)
    let userMessage = (args && args.length > 0) ? args.join(" ").trim() : '';

    if (!userMessage) {
      // No message provided - Show Helping Menu
      return send.reply(`┏╋━━━━◥◣◆◢◤━━━━╋┓
   🤖 𝐑𝐃𝐗𝐀𝐈 𝐀𝐒𝐒𝐈𝐒𝐓𝐀𝐍𝐓 
┗╋━━━━◥◣◆◢◤━━━━╋┛

Main aapka specialized helping assistant hoon! 👋
Mujhse aap bot ke bare mein kuch bhi pooch sakte hain.

🌟 **Aap pooch sakte hain:**
🔹 "Bot kaise use krein?"
🔹 "Coins kaise milte hain?"
🔹 "Bank account kiyu zaroori hai?"
🔹 "Pair command ki details do"
🔹 "TikTok download kaise hogi?"
🔹 "Convo mode kya hai?"

👉 Type: **${config.PREFIX}rdxai [aapka sawal]**
Aap direct reply bhi de sakte hain! ✨`);
    }

    api.setMessageReaction('⏳', messageID, () => { }, true);

    try {
      // First check for specific guide queries (like goibot checks for commands)
      const queryMatch = detectCommandQuery(userMessage);

      if (queryMatch && userMessage.length < 120) {
        // For specific short queries, show the guide
        if (queryMatch.type === 'guide') {
          const guide = GUIDES[queryMatch.guide];
          if (guide) {
            api.setMessageReaction('✅', messageID, () => { }, true);

            // For owner guide, also send the profile card
            if (queryMatch.guide === 'owner') {
              const ownerCard = generateOwnerCard();
              return api.sendMessage(`${guide}\n\n${ownerCard}`, threadID, (err, info) => {
                if (info && info.messageID) {
                  global.client.replies.set(info.messageID, {
                    commandName: "rdxai",
                    messageID: info.messageID,
                    author: senderID
                  });
                }
              }, messageID);
            }

            return api.sendMessage(guide, threadID, (err, info) => {
              if (info && info.messageID) {
                global.client.replies.set(info.messageID, {
                  commandName: "rdxai",
                  messageID: info.messageID,
                  author: senderID
                });
              }
            }, messageID);
          }
        } else if (queryMatch.type === 'command') {
          const guide = formatCommandGuide(queryMatch.command, config.PREFIX);
          api.setMessageReaction('✅', messageID, () => { }, true);
          return api.sendMessage(guide, threadID, (err, info) => {
            if (info && info.messageID) {
              global.client.replies.set(info.messageID, {
                commandName: "rdxai",
                messageID: info.messageID,
                author: senderID
              });
            }
          }, messageID);
        }
      }

      // FOR ALL OTHER MESSAGES: Use AI to respond conversationally
      // Like goibot - just chat with the user, understanding full context
      const aiResponse = await getAIResponse(senderID, userMessage);
      api.setMessageReaction('✅', messageID, () => { }, true);

      return api.sendMessage(aiResponse, threadID, (err, info) => {
        if (info && info.messageID) {
          global.client.replies.set(info.messageID, {
            commandName: "rdxai",
            messageID: info.messageID,
            author: senderID
          });
        }
      }, messageID);
    } catch (error) {
      api.setMessageReaction('❌', messageID, () => { }, true);
      const errMsg = error.message || 'Unknown error';
      if (errMsg.includes('401') || errMsg.includes('Unauthorized') || errMsg.includes('invalid') || errMsg.includes('API')) {
        api.sendMessage(`❌ AI API Key expired ya invalid hai!\n\nAdmin se bolo: ${config.PREFIX}setrdxaikey [new_key]\n\n🔑 Key yahan se lo: https://console.cerebras.ai/`, threadID, messageID);
      } else {
        api.sendMessage(`❌ Error: ${errMsg}\n\nAsk SARDAR RDX for help.`, threadID, messageID);
      }
    }
  },

  async handleReply({ api, event, handleReply }) {
    const { threadID, messageID, senderID, body } = event;
    if (senderID !== handleReply.author) return;

    const prompt = body.trim();
    if (!prompt) return;

    api.setMessageReaction('💭', messageID, () => { }, true);

    try {
      // RESPOND TO REPLIES - Just chat naturally with AI
      const aiResponse = await getAIResponse(senderID, prompt);
      api.setMessageReaction('✅', messageID, () => { }, true);

      return api.sendMessage(aiResponse, threadID, (err, info) => {
        if (info && info.messageID) {
          global.client.replies.set(info.messageID, {
            commandName: "rdxai",
            messageID: info.messageID,
            author: senderID
          });
        }
      }, messageID);
    } catch (error) {
      api.setMessageReaction('❌', messageID, () => { }, true);
      api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
  }
};
