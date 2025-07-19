const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "owner",
    aliases: ["botinfo"],
    version: "1.0",
    author: "𝐀Ⓛ𝐀Μ𝕀ℕ",
    countDown: 20,
    role: 0,
    shortDescription: {
      en: "Show bot and owner info"
    },
    longDescription: {
      en: "Displays detailed information about the bot and its owner"
    },
    category: "owner",
    guide: {
      en: "{pn} — Show owner info"
    }
  },

  onStart: async function ({ message }) {
    const now = moment().tz('Asia/Riyadh');
    const date = now.format('MMMM Do YYYY');
    const time = now.format('hh:mm:ss A');

    const uptime = process.uptime();
    const days = Math.floor(uptime / (60 * 60 * 24));
    const hours = Math.floor((uptime / (60 * 60)) % 24);
    const minutes = Math.floor((uptime / 60) % 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const msg = `
╭────⭓ 𝐁𝐎𝐓 & 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎
│ 🤖 Bot Name     : 𝐓𝐎𝐌-𝐁𝐎𝐓 
│ ⚙️ Prefix       : ${global.GoatBot.config.prefix}
│ 👨‍💻 Owner Name  : 𝐀Ⓛ𝐀Μ𝕀ℕ
│ 🎂 Age          : 20
│ 💞 Status       : ❤ Single
│ 🌐 Facebook     : facebook.com/alamin.official.7031
│ 📅 Date         : ${date}
│ ⏰ Time         : ${time}
│ 🟢 Uptime       : ${uptimeString}
╰─────────────────⭓
`;

    const sent = await message.reply(msg);
    
    setTimeout(() => {
      message.unsend(sent.messageID);
    }, 20000); // ২০ সেকেন্ড পরে মেসেজ unsend হবে
  }
};
