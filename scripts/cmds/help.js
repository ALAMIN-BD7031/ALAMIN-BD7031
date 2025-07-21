const fs = require("fs");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "3.2",
    author: "NTKhang // xnil6x",
    countDown: 5,
    role: 0,
    description: "View command information with enhanced interface",
    category: "info",
    guide: {
      en: "{pn} [command] - View command details\n{pn} all - View all commands\n{pn} c [category] - View commands in category"
    }
  },

  langs: {
    en: {
      helpHeader: "╔════════◇◆◇════════╗\n"
                + "║      BOT COMMAND LIST           ║\n"
                + "╠════════◇◆◇════════╣",
      categoryHeader: "\n╔── {category} ──╗\n",
      commandItem: "║ 📂: {name}",
      helpFooter: "╚════════◇◆◇════════╝",
      commandInfo: "╔════════◇◆◇════════╗\n"
                 + "║     COMMAND INFORMATION     ║\n"
                 + "╠═════════◇◆◇═════════╣\n"
                 + "║ 🏷️ Name: {name}\n"
                 + "║ 📝 Description: {description}\n"
                 + "║ 📂 Category: {category}\n"
                 + "║ 🔤 Aliases: {aliases}\n"
                 + "║ 🏷️ Version: {version}\n"
                 + "║ 🔒 Permissions: {role}\n"
                 + "║ ⏱️ Cooldown: {countDown}s\n"
                 + "║ 🔧 Use Prefix: {usePrefix}\n"
                 + "║ 👤 Author: {author}\n"
                 + "╠═════════◇◆◇═════════╣",
      usageHeader: "║ 🛠️ USAGE GUIDE",
      usageBody: "║ {usage}",
      usageFooter: "╚═════════◇◆◇═════════╝",
      commandNotFound: "⚠️ Command '{command}' not found!",
      doNotHave: "None",
      roleText0: "👥 All Users",
      roleText1: "👑 Group Admins",
      roleText2: "⚡ Bot Admins",
      totalCommands: "📊 Total Commands: {total}\n𝙰𝙻𝙰𝙼𝙸𝙽 👈"
    }
  },

  onStart: async function({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);
    const commandName = args[0]?.toLowerCase();

    if (commandName === 'c' && args[1]) {
      const categoryArg = args[1].toUpperCase();
      const commandsInCategory = [];

      for (const [name, cmd] of commands) {
        if (cmd.config.role > 1 && role < cmd.config.role) continue;
        const category = cmd.config.category?.toUpperCase() || "GENERAL";
        if (category === categoryArg) {
          commandsInCategory.push({ name });
        }
      }

      if (commandsInCategory.length === 0) {
        return message.reply(`❌ No commands found in category: ${categoryArg}`);
      }

      let replyMsg = this.langs.en.helpHeader;
      replyMsg += this.langs.en.categoryHeader.replace(/{category}/g, categoryArg);

      commandsInCategory.sort((a, b) => a.name.localeCompare(b.name)).forEach(cmd => {
        replyMsg += this.langs.en.commandItem.replace(/{name}/g, cmd.name) + "\n";
      });

      replyMsg += this.langs.en.helpFooter;
      replyMsg += "\n" + this.langs.en.totalCommands.replace(/{total}/g, commandsInCategory.length);

      return message.reply(replyMsg);
    }

    if (!commandName || commandName === 'all') {
      const categories = new Map();

      for (const [name, cmd] of commands) {
        if (cmd.config.role > 1 && role < cmd.config.role) continue;

        const category = cmd.config.category?.toUpperCase() || "GENERAL";
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category).push({ name });
      }

      const sortedCategories = [...categories.keys()].sort();
      let replyMsg = this.langs.en.helpHeader.replace(/{prefix}/g, prefix);
      let totalCommands = 0;

      for (const category of sortedCategories) {
        const commandsInCategory = categories.get(category).sort((a, b) => a.name.localeCompare(b.name));
        totalCommands += commandsInCategory.length;

        replyMsg += this.langs.en.categoryHeader.replace(/{category}/g, category);

        commandsInCategory.forEach(cmd => {
          replyMsg += this.langs.en.commandItem.replace(/{name}/g, cmd.name) + "\n";
        });

        replyMsg += this.langs.en.helpFooter;
      }

      replyMsg += "\n" + this.langs.en.totalCommands.replace(/{total}/g, totalCommands);
      return message.reply(replyMsg);
    }

    let cmd = commands.get(commandName) || commands.get(aliases.get(commandName));
    if (!cmd) {
      return message.reply(this.langs.en.commandNotFound.replace(/{command}/g, commandName));
    }

    const config = cmd.config;
    const aliasesList = config.aliases?.join(", ") || this.langs.en.doNotHave;
    const usage = (config.guide?.en || "").replace(/{pn}/g, prefix + config.name);
    const roleText = this.langs.en[`roleText${config.role}`] || `Unknown (Level ${config.role})`;

    let replyMsg = this.langs.en.commandInfo
      .replace(/{name}/g, config.name)
      .replace(/{description}/g, config.description || this.langs.en.doNotHave)
      .replace(/{category}/g, config.category || this.langs.en.doNotHave)
      .replace(/{aliases}/g, aliasesList)
      .replace(/{version}/g, config.version || "1.0")
      .replace(/{role}/g, roleText)
      .replace(/{countDown}/g, config.countDown || 0)
      .replace(/{usePrefix}/g, prefix)
      .replace(/{author}/g, config.author || this.langs.en.doNotHave);

    if (usage) {
      replyMsg += `\n${this.langs.en.usageHeader}\n`;
      replyMsg += this.langs.en.usageBody.replace(/{usage}/g, usage) + "\n";
    }

    replyMsg += this.langs.en.usageFooter;
    return message.reply(replyMsg);
  }
};
