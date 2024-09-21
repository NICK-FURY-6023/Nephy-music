var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder } from "discord.js";
import { Accessableby } from "../../structures/Command.js";
import prettyMilliseconds from "pretty-ms";
export default class {
    constructor() {
        this.name = ["uptime"];
        this.description = "Shows the uptime information of the Bot";
        this.category = "Info";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = [];
        this.lavalink = true;
        this.options = [];
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const uptime = new EmbedBuilder()
                .setAuthor({
                name: `${client.getString(handler.language, "command.info", "uptime_title")}` + client.user.username,
            })
                .setDescription(`${client.getString(handler.language, "command.info", "uptime_desc", {
                uptime: prettyMilliseconds(Number(client.uptime)),
            })}`)
                .setTimestamp()
                .setColor(client.color);
            yield handler.editReply({ embeds: [uptime] });
        });
    }
}
