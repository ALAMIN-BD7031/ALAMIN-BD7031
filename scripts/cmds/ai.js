const axios = require("axios");
const mongoose = require("mongoose");

// MongoDB schema (auto create if not exists)
const ShipuMemory = mongoose.models.ShipuMemory || mongoose.model("ShipuMemory", new mongoose.Schema({
  userID: String,
  memory: String,
  personality: { type: String, default: "default" }
}));

const apiUrl = "https://shipu-ai.onrender.com/api.php?action=";

module.exports = {
  config: {
    name: "ai",
    aliases: ["ai", "Ai"],
    version: "1.2",
    author: "Chitron Bhattacharjee",
    countDown: 1,
    role: 0,
    shortDescription: {
      en: "Talk with ai (with memory and personality)"
    },
    longDescription: {
      en: "Chat with powered AI. Continues chat with memory, supports personality modes."
    },
    category: "ai",
    guide: {
      en: "-ai [message] or reply to Ai\n+ai setpersonality [funny|formal|sarcastic]\nNo-prefix supported too"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const uid = event.senderID;
    const input = args.join(" ");

    if (!input) return message.reply("📩 | Please provide a message or reply to a message.");

    // Personality setter
    if (args[0]?.toLowerCase() === "setpersonality") {
      const mode = args[1]?.toLowerCase();
      if (!mode) return message.reply("⚙️ | Usage: +ai setpersonality [mode]");
      await ShipuMemory.findOneAndUpdate({ userID: uid }, { personality: mode }, { upsert: true });
      return message.reply(`✅ | Personality set to **${mode}**`);
    }

    handleConversation(api, event, input);
  },

  onReply: async function ({ api, event }) {
    const userInput = event.body?.toLowerCase();
    if (!userInput) return;
    handleConversation(api, event, userInput);
  },

  onChat: async function ({ api, event }) {
    const body = event.body?.toLowerCase();
    if (!body) return;

    const prefixes = ["ai"];
    const matched = prefixes.find(p => body.startsWith(p));
    if (!matched) return;

    const content = body.slice(matched.length).trim();
    if (!content) {
      const prompts = [
        "👋 Hey there! How can I help you today ?",
        ""
      ];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      return api.sendMessage(randomPrompt, event.threadID, (err, info) => {
        if (!info?.messageID) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "ai",
          type: "reply",
          author: event.senderID
        });
      }, event.messageID);
    }

    handleConversation(api, event, content);
  }
};

// 🔁 Handle user conversation
async function handleConversation(api, event, userInput) {
  const uid = event.senderID;
  let memory = "";
  let personality = "default";

  // 🔍 Try to load memory/personality
  try {
    const userData = await ShipuMemory.findOne({ userID: uid });
    if (userData) {
      memory = userData.memory || "";
      personality = userData.personality || "default";
    }
  } catch (err) {
    console.log("⚠️ MongoDB not connected or memory fetch failed.");
  }

  try {
    const query = memory ? `${memory}\nUser: ${userInput}` : userInput;
    const fullQuery = `[${personality} mode]\n${query}`;

    const res = await axios.get(apiUrl + encodeURIComponent(fullQuery));
    const { botReply, status } = res.data;

    if (status !== "success") {
      return api.sendMessage("❌ | Ai couldn't reply. Try again later.", event.threadID, event.messageID);
    }

    // Save new memory
    try {
      const newMemory = `User: ${userInput}\nAi: ${botReply}`;
      await ShipuMemory.findOneAndUpdate({ userID: uid }, { memory: newMemory }, { upsert: true });
    } catch (e) {
      console.log("⚠️ Failed to save memory.");
    }

    const styled = `╭────────────╮\n ▄ 🧠 𝗔𝗜 𝘀𝗮𝗶𝗱:\n▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\n\n\n${botReply}\n\n──────────────\n▄ 📩 𝗬𝗼𝘂: ${userInput}\n▄▄▄▄▄▄▄▄▄▄▄▄▄\n╔══════════╗\n║ 👤𝗠𝗼𝗱𝗲: ${personality}\n║ 🖊️𝗔𝘂𝘁𝗵𝗼𝗿: Chitron\n║ Bhattacharjee\n╚══════════╝`;

    api.sendMessage(styled, event.threadID, (err, info) => {
      if (!info?.messageID) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "ai",
        type: "reply",
        author: event.senderID
      });
    }, event.messageID);
  } catch (err) {
    console.error(err);
    api.sendMessage("⚠️ | who are you baby 😘.", event.threadID, event.messageID);
  }
}
