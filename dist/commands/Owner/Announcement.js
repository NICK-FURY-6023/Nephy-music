var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["announcement"];
        this.description = "Send announcement mesage to all server";
        this.category = "Owner";
        this.accessableby = Accessableby.Admin;
        this.usage = "<your_message>";
        this.aliases = ["an"];
        this.lavalink = false;
        this.usingInteraction = false;
        this.playerCheck = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            if (!handler.args[0] || !handler.message)
                return handler.editReply({
                    embeds: [new EmbedBuilder().setColor(client.color).setDescription("`⚠️` | Empty args!")],
                });
            const avalibleChannel = [];
            const allGuild = client.guilds.cache.map((guild) => guild);
            let sentSuccesfully = 0;
            for (const guild of allGuild) {
                const channelFilterTextBased = guild.channels.cache.filter((channel) => channel.isTextBased());
                const channelFilterPermission = channelFilterTextBased.filter((channel) => { var _a; return (_a = channel.guild.members.me) === null || _a === void 0 ? void 0 : _a.permissions.has(PermissionFlagsBits.SendMessages); });
                const channelFilterGeneral = channelFilterPermission.filter((channel) => channel.name.includes("general"));
                const channelFilterNonGeneral = channelFilterPermission.filter((channel) => !channel.name.includes("general"));
                if (channelFilterGeneral.size !== 0) {
                    avalibleChannel.push(channelFilterGeneral.first());
                }
                else {
                    avalibleChannel.push(channelFilterNonGeneral.first());
                }
            }
            const parsed = handler.message.content.replace(handler.prefix, "").split(" ");
            const block = this.parse(parsed.slice(1).join(" "));
            for (const channel of avalibleChannel) {
                sentSuccesfully = sentSuccesfully + 1;
                const announcement = new EmbedBuilder()
                    .setAuthor({ name: "💫 | Announcement" })
                    .setDescription(block !== null ? block[2] : parsed.slice(1).join(" "))
                    .setColor(client.color)
                    .setFooter({
                    text: `${handler.guild.members.me.displayName}`,
                    iconURL: client.user.displayAvatarURL(),
                });
                try {
                    channel.send({ embeds: [announcement] });
                }
                catch (err) {
                    sentSuccesfully = sentSuccesfully - 1;
                }
            }
            const result = new EmbedBuilder()
                .setDescription(`\`🟢\` | **Sent successfully in ${sentSuccesfully}**\n\`🔴\` | **Sent failed in ${avalibleChannel.length - sentSuccesfully}**`)
                .setColor(client.color)
                .setFooter({
                text: `${handler.guild.members.me.displayName}`,
                iconURL: client.user.displayAvatarURL(),
            });
            yield handler.editReply({ embeds: [result] });
        });
    }
    parse(content) {
        const result = content.match(/^```(.*?)\n(.*?)```$/ms);
        return result ? result.slice(0, 3).map((el) => el.trim()) : null;
    }
}
