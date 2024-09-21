var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Manager } from "../../manager.js";
export default class {
    constructor() {
        this.name = ["invite"];
        this.description = "Shows the invite information of the Bot";
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
            const invite = new EmbedBuilder()
                .setTitle(`${client.getString(handler.language, "command.info", "inv_title", {
                username: client.user.username,
            })}`)
                .setDescription(`${client.getString(handler.language, "command.info", "inv_desc", {
                username: client.user.username,
            })}`)
                .addFields([
                {
                    name: "Nephy-music ",
                    value: "https://github.com/NICK-FURY-6023/Nephy-music",
                    inline: false,
                },
            ])
                .setTimestamp()
                .setColor(client.color);
            const row2 = new ActionRowBuilder < ButtonBuilder > ().addComponents(new ButtonBuilder()
                .setLabel("Invite Me")
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`));
            yield handler.editReply({ embeds: [invite], components: [row2] });
        });
    }
}
