module.exports = {
  config: {
    name: 'work',
    aliases: ['job', 'earn'],
    description: "Work a random job to earn coins.",
    credits: "SARDAR RDX",
    usage: 'work',
    category: 'Economy',
    prefix: true
  },
  
  async run({ api, event, send, Currencies, Users }) {
    const { senderID } = event;
    
    const result = Currencies.work(senderID);
    const name = await Users.getNameUser(senderID);
    
    if (!result.success) {
      const mins = result.remaining;
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      
      let timeText = '';
      if (hours > 0) {
        timeText = `${hours}h ${remainingMins}m`;
      } else {
        timeText = `${remainingMins}m`;
      }
      
      return send.reply(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  😴  THORA ARAM KARLO!    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛

👤 Username: ${name}
💬 Status: Busy 🏢

⏳ Rest Time Remaining:
   ⌛ ${timeText}

📍 Next work available in ${timeText}

💡 Tip: Ism dauraan aur kuch commands use karo!

┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`.trim());
    }
    
    const balance = Currencies.getBank(senderID);
    
    return send.reply(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ✅ WORK COMPLETED! 💼  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛

👤 Worker: ${name}
🏢 Job Type: ${result.job}
⭐ Status: Completed ✔️

═════════════════════════════
💰 EARNINGS REPORT
═════════════════════════════
💵 Amount Earned: +${result.earnings.toLocaleString()} Coins 🎉
💳 New Total: ${balance.toLocaleString()} Coins
═════════════════════════════

📊 Work Stats:
  ✓ Job completed successfully
  ✓ Coins added to bank
  ✓ Next available: 30 minutes

🔔 Remember: Keep working to earn more! 🚀

┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`.trim());
  }
};

