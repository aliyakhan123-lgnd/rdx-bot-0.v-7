module.exports = {
  config: {
    name: 'daily',
    aliases: ['claim', 'reward'],
    description: "Claim your daily registration reward coins.",
    credits: "SARDAR RDX",
    usage: 'daily',
    category: 'Economy',
    prefix: true
  },
  
  async run({ api, event, send, Currencies, Users }) {
    const { senderID } = event;
    
    const result = Currencies.claimDaily(senderID);
    const name = await Users.getNameUser(senderID);
    
    if (!result.success) {
      if (result.reason === 'already_claimed') {
        return send.reply(`╭───────────────╮
  ✨ 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗖𝗟𝗔𝗜𝗠𝗘𝗗 ✨
╰───────────────╯

  👤 𝗛𝗲𝗹𝗹𝗼 ${name}!
  🚫 Aapne aaj ka gift le liya hai.
  
  📅 Kal phir aaiye naye surprises ke liye!
  
  ✨ Keep Supporting RDX ✨`.trim());
      }
    }
    
    const balance = Currencies.getBank(senderID);
    
    return send.reply(`╭──────────────────╮
     🌟 𝗗𝗔𝗜𝗟𝗬 𝗥𝗘𝗪𝗔𝗥𝗗 🌟
╰──────────────────╯

  👤 𝗨𝘀𝗲𝗿   : ${name}
  💰 𝗥𝗲𝘄𝗮𝗿𝗱 : +${result.reward.toLocaleString()} Coins
  🔥 𝗦𝘁𝗿𝗲𝗮𝗸 : ${result.streak} Days Streak!

  🏦 𝗧𝗼𝘁𝗮𝗹 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: ${balance.toLocaleString()} Coins

  💡 Rozana claim karein streak barhane ke liye!
  ────────────────────
     ✨ 𝗥𝗗𝗫 𝗕𝗢𝗧 𝗘𝗖𝗢𝗡𝗢𝗠𝗬 ✨`.trim());
  }
};

