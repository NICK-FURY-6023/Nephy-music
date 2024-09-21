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
export default class {
    constructor() {
        this.name = ["ping"];
        this.description = "Shows the ping information of the Bot";
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
            const ping = new EmbedBuilder()
                .setAuthor({
                name: `${client.getString(handler.language, "command.info", "ping_title")}` + client.user.username,
            })
                .setDescription(`${client.getString(handler.language, "command.info", "ping_desc", {
                ping: String(client.ws.ping),
                response: String(Date.now() - handler.createdAt),
            })}`)
                .setTimestamp()
                .setColor(client.color);
            yield handler.editReply({ embeds: [ping] });
        });
    }
}
