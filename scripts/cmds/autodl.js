const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "downloader",
    version: "1.0.3",
    author: "ArYAN",
    countDown: 0,
    role: 0,
    shortDescription: "Download videos from YouTube, TikTok, Instagram, Facebook",
    category: "media",
    guide: ["[video_link]"],
  },

  onStart: async function ({ api, event }) {
    return api.sendMessage("✅ Downloader is ready.\nSend a video link to download (YouTube, TikTok, IG, FB).", event.threadID);
  },

  onChat: async function ({ api, event }) {
    const { threadID, messageID, body } = event;
    if (!body) return;

    const linkMatch = body.match(/(https?:\/\/[^\s]+)/);
    if (!linkMatch) return;

    const url = linkMatch[0].trim();
    let platform = "";
    let apiUrl = "";

    if (/tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com/.test(url)) {
      platform = "tiktok";
      apiUrl = `https://api-aryan-xyz.vercel.app/tikdl?url=${encodeURIComponent(url)}&apikey=ArYAN`;
    } else if (/instagram\.com/.test(url)) {
      platform = "instagram";
      apiUrl = `https://api-aryan-xyz.vercel.app/igdl?url=${encodeURIComponent(url)}&apikey=ArYAN`;
    } else if (/facebook\.com|fb\.watch/.test(url)) {
      platform = "facebook";
      apiUrl = `https://api-aryan-xyz.vercel.app/fbdl?url=${encodeURIComponent(url)}&apikey=ArYAN`;
    } else if (/youtube\.com|youtu\.be/.test(url)) {
      platform = "youtube";
      apiUrl = `https://api-aryan-xyz.vercel.app/ytdl?url=${encodeURIComponent(url)}&apikey=ArYAN`;
    } else {
      return;
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    const tempDir = path.join(__dirname, "..", "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    try {
      const { data } = await axios.get(apiUrl);
      const result = data?.result || {};

      let videoUrl = "";
      let title = "Downloaded Video";

      switch (platform) {
        case "tiktok":
          videoUrl = result?.video_url || result?.url || result?.videoUrl;
          title = result?.title || "TikTok Video";
          break;

        case "instagram":
          videoUrl = result?.video_url || result?.videoUrl;
          title = result?.title || "Instagram Video";
          break;

        case "facebook":
          videoUrl =
            result?.videoUrl ||
            result?.url ||
            result?.HD ||
            result?.SD ||
            result?.response?.["720p"]?.download_url ||
            result?.response?.["360p"]?.download_url;
          title =
            result?.title ||
            result?.response?.["720p"]?.title ||
            result?.response?.["360p"]?.title ||
            "Facebook Video";
          break;

        case "youtube":
          if (result?.response) {
            videoUrl = result.response["720p"]?.download_url || result.response["360p"]?.download_url;
            title = result.response["720p"]?.title || result.response["360p"]?.title || "YouTube Video";
          } else {
            videoUrl = result?.url || "";
            title = result?.title || "YouTube Video";
          }
          break;
      }

      if (!videoUrl) return;

      const filePath = path.join(tempDir, `video_${Date.now()}.mp4`);
      const response = await axios({ method: "GET", url: videoUrl, responseType: "stream" });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      api.setMessageReaction("✅", messageID, () => {}, true);

      await api.sendMessage(
        {
          body: `${title}`,
          attachment: fs.createReadStream(filePath),
        },
        threadID,
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("Facebook Downloader Error:", err.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
    }
  },
};
