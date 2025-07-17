let isBusyOn = true; // ডিফল্ট চালু থাকবে

module.exports = {
  config: {
    name: "busy1",
    version: "1.2",
    author: "Alamin + ChatGPT",
    countDown: 0,
    role: 0,
    shortDescription: "Toggle boss busy reply on/off",
    longDescription: "Turn on/off busy auto reply with custom styled message",
    category: "utility"
  },

  onStart: async function({ api, event, args }) {
    if (args[0] === "on") {
      isBusyOn = true;
      api.sendMessage("✅ Busy reply is now ON.", event.threadID);
    } else if (args[0] === "off") {
      isBusyOn = false;
      api.sendMessage("❌ Busy reply is now OFF.", event.threadID);
    } else {
      api.sendMessage(`📌 Use: /busy on অথবা /busy off`, event.threadID);
    }
  },

  onChat: async function({ api, event }) {
    if (!isBusyOn) return;

    const busyNames = [
      "TOM 卝 চৌধুরীヅ",
      "টম",
      "Tom"
    ];

    const fbLink = "https://www.facebook.com/alamin.official.7031";

    const message = event.body;
    if (message && typeof message === "string") {
      for (let name of busyNames) {
        if (message.includes(name)) {
          api.sendMessage(
            `🙏𝐌𝐲 𝐁𝐨𝐬𝐬= 𝐓𝐎𝐌 卝 চৌধুরীヅ \n𝐢𝐬 𝐜𝐮𝐫𝐫𝐞𝐧𝐭𝐥𝐲 𝐛𝐮𝐬𝐲 𝐫𝐢𝐠𝐡𝐭 𝐧𝐨𝐰💘.\n\n📩 জরুরী প্রয়োজনে 𝐅𝐁 👇: \n${fbLink}`,
            event.threadID
          );
          break;
        }
      }
    }
  }
};
