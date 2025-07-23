const axios = require("axios");

module.exports = {
  config: {
    name: "gemini",
    aliases: ["ai", "chat"],
    version: "0.0.2",
    author: "ArYAN",
    countDown: 3,
    role: 0,
    shortDescription: "Ask Gemini AI",
    longDescription: "Talk with Gemini AI using Aryan's API",
    category: "AI",
    guide: "/gemini [your question]"
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("❌ Please provide a question or prompt to ask Gemini.", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await axios.get(`https://aryan-nix-apis.vercel.app/api/gemini?prompt=${encodeURIComponent(prompt)}`);
      const reply = res.data?.response;

      if (!reply) throw new Error("No response from Gemini API.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage(reply, event.threadID, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID
        });
      }, event.messageID);
    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("⚠️ Gemini API theke response pawa jachchhe na.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if ([api.getCurrentUserID()].includes(event.senderID)) return;

    const prompt = event.body;
    if (!prompt) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await axios.get(`https://aryan-nix-apis.vercel.app/api/gemini?prompt=${encodeURIComponent(prompt)}`);
      const reply = res.data?.response;

      if (!reply) throw new Error("No response from Gemini API.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage(reply, event.threadID, (err, info) => {
        if (!info) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID
        });
      }, event.messageID);
    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("⚠️ Gemini API er response dite somossa hocchhe.", event.threadID, event.messageID);
    }
  }
};
