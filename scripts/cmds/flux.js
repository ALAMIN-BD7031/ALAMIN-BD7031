const axios = require('axios');

module.exports = {
  config: {
    name: "flux",
    aliases: [],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Generate image using Flux API"
    },
    longDescription: {
      en: "Send a prompt to the Flux API and get back an image."
    },
    category: "ai",
    guide: {
      en: "{pn} [prompt text]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("Please provide a prompt.\nExample: flux cyberpunk city", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const apiUrl = `https://aryan-xyz-flux-sigma.vercel.app/flux?prompt=${encodeURIComponent(prompt)}`;

    try {
      const res = await axios.get(apiUrl, { responseType: 'stream' });

      await api.sendMessage({
        body: `🎀 Here is your Flux image for\n  "${prompt}"`,
        attachment: res.data
      }, event.threadID, null, event.messageID);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error("Flux API Error:", error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
