const fs = require("fs");

const REACT_FILE = __dirname + "/autoreact.json";

let autoReactData = {};
if (fs.existsSync(REACT_FILE)) {
  autoReactData = JSON.parse(fs.readFileSync(REACT_FILE, "utf8"));
}

const reactions = [
  "❤️", "😂", "😎", "😍", "😅", "😡", "😭", "😴", "🤔", "👌",
  "🔥", "💀", "🥺", "🤩", "🙃", "💔", "👍", "👎", "😆", "😐",
  "😲", "🤫", "🫡", "🤯", "🧐", "🥱", "💯", "😇", "🤗", "😳",
  "🤑", "🤤", "😵", "🙄", "👀", "😬", "😓", "😤", "😈", "💩",
  "😜", "🥳", "🙈", "😔", "🤓", "😚", "🫶", "✨", "🚀", "😹"
];

module.exports = {
  config: {
    name: "autoreact",
    version: "0.0.1",
    author: "ArYAN",
    role: 0,
    shortDescription: "Auto reacts to messages",
    longDescription: "Turns on/off automatic reacting to every message in a chat",
    category: "utility",
    guide: "/autoreact on\n/autoreact off"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID } = event;
    const action = args[0]?.toLowerCase();

    if (!["on", "off"].includes(action)) {
      return api.sendMessage("❌ Use: autoreact on / autoreact off", threadID);
    }

    if (action === "on") {
      autoReactData[threadID] = true;
      fs.writeFileSync(REACT_FILE, JSON.stringify(autoReactData, null, 2));
      return api.sendMessage("✅ Autoreact is now ON", threadID);
    }

    if (action === "off") {
      delete autoReactData[threadID];
      fs.writeFileSync(REACT_FILE, JSON.stringify(autoReactData, null, 2));
      return api.sendMessage("✅Autoreact is now OFF", threadID);
    }
  },

  onChat: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;

    if (!autoReactData[threadID]) return;
    if (senderID === api.getCurrentUserID()) return;

    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    api.setMessageReaction(reaction, messageID, () => {}, true);
  }
};
