module.exports = {
  config: { credits: "SARDAR RDX",
    name: "configv2",
    aliases: ["botconfig", "settings"],
    description: "Advanced bot configuration management.",
    usage: "configv2",
    category: "Admin",
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, send, config }) {
    const { threadID, messageID, senderID } = event;
    const moment = require("moment-timezone");
    const time = moment().tz("Asia/Karachi").format("hh:mm:ss A");

    const msg = `╭───〔 ⚙️ 𝗖𝗢𝗡𝗙𝗜𝗚 𝗩𝟮 〕───╮
│
│ 📝 1. Change Bot Bio
│ 🏷️ 2. Change Bot Nickname
│ 📥 3. View Pending Messages
│ 📬 4. View Unread Messages
│ 🛡️ 5. Bot Avatar Shield (On/Off)
│ 👤 6. Change Bot Avatar
│ 🚫 7. Block User
│ 🔓 8. Unblock User
│ 📝 9. Create Post
│ 🗑️ 10. Delete Post
│ ➕ 12. Send Friend Requests
│ 🤝 13. Accept Friend Requests
│ ❌ 14. Decline Friend Requests
│ 🗑️ 15. Unfriend User
│ 🚪 11. Logout Bot
│
├───────────────────
│ 💡 Reply with Number to Choose
│ ⏰ Time: ${time}
╰───────────────────╯`;

    return send.reply(msg, (err, info) => {
      if (global.client && global.client.replies) {
        global.client.replies.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: "menu"
        });
      }
    });
  },

  async handleReply({ api, event, handleReply, send }) {
    const { type, author } = handleReply;
    const { threadID, messageID, senderID, body } = event;
    if (author != senderID) return;

    const botID = api.getCurrentUserID();
    const args = body.split(" ");

    if (type == 'menu') {
      const choice = args[0];
      switch (choice) {
        case "1":
          return send.reply("Please reply with the new BIO for the bot (or type 'delete').", (err, info) => {
            global.client.replies.set(info.messageID, { commandName: "configv2", messageID: info.messageID, author: senderID, type: "changeBio" });
          });
        case "2":
          return send.reply("Please reply with the new NICKNAME for the bot (or type 'delete').", (err, info) => {
            global.client.replies.set(info.messageID, { commandName: "configv2", messageID: info.messageID, author: senderID, type: "changeNickname" });
          });
        case "3":
          try {
            const pending = await api.getThreadList(50, null, ["PENDING"]);
            let pMsg = "📬 𝗣𝗘𝗡𝗗𝗜𝗡𝗚 𝗟𝗜𝗦𝗧:\n\n";
            pending.forEach(t => pMsg += `• ${t.name || 'Unknown'} (${t.threadID})\n`);
            return send.reply(pMsg || "No pending messages.");
          } catch(e) { return send.reply("❌ Error fetching pending list."); }
        case "4":
          try {
            const unread = await api.getThreadList(50, null, ["unread"]);
            let uMsg = "📥 𝗨𝗡𝗥𝗘𝗔𝗗 𝗟𝗜𝗦𝗧:\n\n";
            unread.forEach(t => uMsg += `• ${t.name || 'Unknown'} (${t.threadID})\n`);
            return send.reply(uMsg || "No unread messages.");
          } catch(e) { return send.reply("❌ Error fetching unread list."); }
        case "5":
          return send.reply("Reply 'on' or 'off' to toggle Avatar Shield.", (err, info) => {
            global.client.replies.set(info.messageID, { commandName: "configv2", messageID: info.messageID, author: senderID, type: "toggleShield" });
          });
        case "6":
          return send.reply("Please reply with an Image URL or Photo to change Avatar.", (err, info) => {
            global.client.replies.set(info.messageID, { commandName: "configv2", messageID: info.messageID, author: senderID, type: "changeAvatar" });
          });
        case "11":
          return api.logout(() => send.reply("Bot logged out successfully."));
        case "12":
          return send.reply("Reply with the User ID(s) to send friend requests (separated by space).", (err, info) => {
            global.client.replies.set(info.messageID, { commandName: "configv2", messageID: info.messageID, author: senderID, type: "addFriends" });
          });
        case "13":
          return send.reply("Reply with the User ID(s) to accept friend requests.", (err, info) => {
            global.client.replies.set(info.messageID, { commandName: "configv2", messageID: info.messageID, author: senderID, type: "acceptFriend" });
          });
        case "14":
          return send.reply("Reply with the User ID(s) to decline friend requests.", (err, info) => {
            global.client.replies.set(info.messageID, { commandName: "configv2", messageID: info.messageID, author: senderID, type: "declineFriend" });
          });
        case "15":
          return send.reply("Reply with the User ID(s) to unfriend.", (err, info) => {
            global.client.replies.set(info.messageID, { commandName: "configv2", messageID: info.messageID, author: senderID, type: "unFriend" });
          });
        default:
          return send.reply("Invalid choice. Please pick a number from the menu.");
      }
    }

    if (type == 'addFriends') {
      const ids = body.split(/\s+/);
      for (const id of ids) {
        api.handleFriendRequest(id, true, (err) => {
          if (err) send.reply(`❌ Error sending request to ${id}`);
          else send.reply(`✅ Request sent to ${id}`);
        });
      }
    }

    if (type == 'acceptFriend') {
      const ids = body.split(/\s+/);
      for (const id of ids) {
        api.handleFriendRequest(id, true, (err) => {
          if (err) send.reply(`❌ Error accepting ${id}`);
          else send.reply(`✅ Accepted request from ${id}`);
        });
      }
    }

    if (type == 'declineFriend') {
      const ids = body.split(/\s+/);
      for (const id of ids) {
        api.handleFriendRequest(id, false, (err) => {
          if (err) send.reply(`❌ Error declining ${id}`);
          else send.reply(`✅ Declined request from ${id}`);
        });
      }
    }

    if (type == 'unFriend') {
      const ids = body.split(/\s+/);
      for (const id of ids) {
        api.unfriend(id, (err) => {
          if (err) send.reply(`❌ Error unfriending ${id}`);
          else send.reply(`✅ Unfriended ${id}`);
        });
      }
    }

    if (type == 'changeAvatar') {
      let imgUrl;
      if (body && body.match(/^((http(s?)?):\/\/)?([wW]{3}\.)?[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/g)) imgUrl = body;
      else if (event.attachments[0] && event.attachments[0].type == "photo") imgUrl = event.attachments[0].url;
      else return send.reply(`Please enter a valid image link or reply to the message with an image.`);
      
      const axios = require("axios");
      try {
        const imgStream = (await axios.get(imgUrl, { responseType: "stream" })).data;
        api.setAvatar(imgStream, (err) => {
          if (err) return send.reply("❌ Error changing avatar.");
          return send.reply("✅ Bot avatar updated successfully!");
        });
      } catch (e) {
        return send.reply("❌ Failed to fetch image.");
      }
    }

    if (type == 'changeNickname') {
      const nickname = body.toLowerCase() == 'delete' ? '' : body;
      api.setNickname(nickname, botID, (err) => {
        if (err) return send.reply("❌ Error changing nickname.");
        return send.reply(`✅ Nickname ${nickname ? "updated to: " + nickname : "deleted"}.`);
      });
    }

    if (type == 'changeBio') {
      const bio = body.toLowerCase() == 'delete' ? '' : body;
      api.changeBio(bio, false, (err) => {
        if (err) return send.reply("❌ Error changing bio.");
        return send.reply(`✅ Bio ${bio ? "updated to: " + bio : "deleted"}.`);
      });
    }

    if (type == 'toggleShield') {
      const state = body.toLowerCase() == 'on';
      const form = {
        av: botID,
        variables: JSON.stringify({ "0": { is_shielded: state, actor_id: botID, client_mutation_id: Math.round(Math.random()*19) } }),
        doc_id: "100017985245260"
      };
      api.httpPost("https://www.facebook.com/api/graphql/", form, (err, data) => {
        if (err) return send.reply("❌ Error toggling shield.");
        return send.reply(`✅ Avatar Shield turned ${state ? 'ON' : 'OFF'}.`);
      });
    }
    
    // Additional handlers (Avatar, Nickname, etc.) can be expanded similarly
  }
};
