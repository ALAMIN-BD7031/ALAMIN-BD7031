const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

const Aryan = "https://raw.githubusercontent.com/itzaryan008/ERROR/refs/heads/main/raw/api.json";

module.exports.config = {
  name: "rndm",
  version: "0.0.3",
  role: 0,
  author: "ArYAN",
  description: "Send a random video by name",
  category: "user",
  noPrefix: true,
  cooldowns: 5
};

module.exports.onStart = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args.length) {
    return api.sendMessage("⚠️ Please provide a name. Example:\n`rndm joy`", threadID, messageID);
  }

  try {
    const configRes = await axios.get(Aryan);
    const baseApi = configRes.data.xyz;

    if (!baseApi) {
      return api.sendMessage("📛 Base API URL not found in config.", threadID, messageID);
    }

    const name = args.join(" ");
    const query = encodeURIComponent(name);
    const apiUrl = `${baseApi}/api/random?name=${query}`;

    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data || !data.data || !data.data.url) {
      return api.sendMessage("❌ Could not find video for that name.", threadID, messageID);
    }

    const { url: videoUrl, name: authorName, cp, length: ln } = data.data;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);
    const file = fs.createWriteStream(filePath);

    https.get(videoUrl, (response) => {
      response.pipe(file);

      file.on("finish", () => {
        api.sendMessage({
          body: `${cp || "Unknown"}\n\n🎁 Total Videos: [${ln}]\n👤 Added by: [${authorName}]`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          fs.unlinkSync(filePath);
        }, messageID);
      });
    }).on("error", (err) => {
      console.error("Download error:", err);
      return api.sendMessage("📛 Failed to download the video.", threadID, messageID);
    });

  } catch (err) {
    console.error("API fetch error:", err);
    return api.sendMessage("📛 Something went wrong while processing your request.", threadID, messageID);
  }
};
