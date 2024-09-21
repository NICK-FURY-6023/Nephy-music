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
        this.name = ["previous"];
        this.description = "Play the previous song in the queue.";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = ["pre"];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.options = [];
        this.permissions = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield handler.deferReply();
            const player = client.rainlink.players.get(handler.guild.id);
            const previousIndex = player.queue.previous.length - 1;
            if (player.queue.previous.length == 0 ||
                player.queue.previous[0].uri == ((_a = player.queue.current) === null || _a === void 0 ? void 0 : _a.uri) ||
                previousIndex < -1)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "previous_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            player.previous();
            player.data.set("endMode", "previous");
            const embed = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.music", "previous_msg")}`)
                .setColor(client.color);
            handler.editReply({ content: " ", embeds: [embed] });
        });
    }
}
