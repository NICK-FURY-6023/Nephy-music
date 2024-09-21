var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Accessableby } from "../../structures/Command.js";
import { stripIndents } from "common-tags";
import { EmbedBuilder, version } from "discord.js";
export default class {
    constructor() {
        this.name = ["info"];
        this.description = "Shows the information of the Bot";
        this.category = "Info";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = [];
        this.lavalink = false;
        this.options = [];
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const botInfo = stripIndents `\`\`\`
    Codename        | ${client.metadata.codename}
    Bot Version     | ${client.metadata.version}
    Node.js         | ${process.version}
    Discord.js      | ${version}
    Autofix Version | ${client.metadata.autofix}
    Guild Count     | ${client.guilds.cache.size}
    User Count      | ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}
    \`\`\``;
            const embed = new EmbedBuilder()
                .setAuthor({
                name: client.user.username,
                iconURL: String(client.user.displayAvatarURL({ size: 2048 })),
            })
                .setColor(client.color)
                .addFields({ name: "Bot Info", value: botInfo })
                .setTimestamp();
            yield handler.editReply({ embeds: [embed] });
        });
    }
}
