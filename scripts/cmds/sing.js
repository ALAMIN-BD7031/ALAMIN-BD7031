const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "sing",
    version: "2.1",
    aliases: ["song", "music", "play"],
    author: "xnil6x // improved by ChatGPT",
    countDown: 5,
    role: 0,
    description: {
      en: "Play a song from YouTube directly"
    },
    category: "media",
    guide: {
      en: "{pn} <song name or YouTube link>\nExample: {pn} valo asi valo thako"
    }
  },

  langs: {
    en: {
      error: "❌ Error: %1",
      noResult: "⭕ No results found for \"%1\".",
      noAudio: "⭕ No audio under 26MB was found.",
      playing: "🎧 Now playing: %1",
      waitMsg: "⏳ Please wait, fetching your song..."
    }
  },

  onStart: async function({ args, message, getLang }) {
    if (!args[0]) return message.reply("❌ Please provide a song name or YouTube link.");

    const input = args.join(" ");
    const isYTUrl = /(youtu\.be\/|youtube\.com\/)/.test(input);
    let videoId = "";

    try {
      // Step 1: Send waiting message
      const waitMsg = await message.reply(getLang("waitMsg"));

      // Auto delete wait message after 5 seconds
      setTimeout(() => {
        message.unsend(waitMsg.messageID);
      }, 5000);

      // Step 2: Process input & get video id
      if (isYTUrl) {
        const match = input.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
        if (match) videoId = match[1];
        else return message.reply("❌ Invalid YouTube link.");
      } else {
        const results = await search(input);
        if (!results.length) return message.reply(getLang("noResult", input));
        videoId = results[0].id;
      }

      // Step 3: Get audio url from API
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const res = await axios.get(`https://xnilapi-glvi.onrender.com/xnil/ytmp3?url=${videoUrl}`);
      const data = res.data?.data;
      const title = data?.info?.title;
      const audioUrl = data?.media;

      // Step 4: Check file size
      const head = await axios.head(audioUrl);
      const size = parseInt(head.headers["content-length"]);
      if (size > 26 * 1024 * 1024) {
        return message.reply(getLang("noAudio"));
      }

      // Step 5: Send audio message
      return message.reply({
        body: getLang("playing", title),
        attachment: await getStreamFromURL(audioUrl)
      });

    } catch (err) {
      return message.reply(getLang("error", err.message));
    }
  }
};

async function search(keyWord) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyWord)}`;
    const res = await axios.get(url);
    const data = JSON.parse(res.data.split("ytInitialData = ")[1].split(";</script>")[0]);

    const contents = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    const results = [];

    for (const item of contents) {
      const video = item.videoRenderer;
      if (video?.lengthText?.simpleText) {
        results.push({
          id: video.videoId,
          title: video.title.runs[0].text
        });
      }
    }

    return results;
  } catch (e) {
    return [];
  }
}
