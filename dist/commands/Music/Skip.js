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
// Main code
export default class {
    constructor() {
        this.name = ["skip"];
        this.description = "Skips the song currently playing.";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = [];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
        this.options = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const player = client.rainlink.players.get(handler.guild.id);
            if (player.queue.size == 0 && player.data.get("autoplay") !== true) {
                const skipped = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "skip_notfound")}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [skipped] });
            }
            else {
                yield player.skip();
                const skipped = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "skip_msg")}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [skipped] });
            }
        });
    }
}
