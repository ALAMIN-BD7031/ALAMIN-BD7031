const os = require("os");

module.exports = {
  config: {
    name: "up",
    version: "3.2",
    author: "xnil6x + Alamin Edit",
    role: 0,
    shortDescription: "Show bot info",
    longDescription: "Uptime, RAM, CPU, prefix, etc.",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message, threadsData }) {
    const uptime = process.uptime();
    const d = Math.floor(uptime / (60 * 60 * 24));
    const h = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
    const m = Math.floor((uptime % (60 * 60)) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${d}d ${h}h ${m}m ${s}s`;

    const cpu = os.cpus()[0].model.split(" @")[0];
    const cores = os.cpus().length;
    const ramUsed = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
    const ramTotal = (os.totalmem() / 1024 / 1024).toFixed(0);
    const platform = os.platform();
    const arch = os.arch();
    const node = process.version;
    const host = os.hostname().slice(0, 14);

    const prefix = global.GoatBot.config.PREFIX || "/";
    const threads = await threadsData.getAll().then(e => e.length);
    const commands = global.GoatBot.commands.size;

    const line = "═".repeat(38);
    const box = `
╔${line}╗
║     👨‍💻 𝗧𝗢𝗠-𝗔𝗶 • 𝗨𝗽𝘁𝗶𝗺𝗲 💫
╟${line}╢
║ ⏱ Uptime : ${uptimeStr.padEnd(16)}
║ ⚙️ CPU : ${cores} Core
║ 🧠 RAM : ${ramUsed}/${ramTotal} MB
║ 💻 OS : ${platform} (${arch})
║ 🏷 Host : ${host}
║ 💬 Threads : ${threads}
║ 🧩 Cmds : ${commands}
║ 🧪 Node : ${node}
║ 🔖 Prefix : ${prefix}
║ 👑 Dev : 𝐀𝐋𝐀𝐌𝐈𝐍 💘
╚${line}╝`;

    message.reply(box);
  }
};
