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
        this.name = ["clearqueue"];
        this.description = "Clear song in queue!";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = ["clear", "cq"];
        this.lavalink = true;
        this.options = [];
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield handler.deferReply();
            const player = client.rainlink.players.get(handler.guild.id);
            player.queue.clear();
            const cleared = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.music", "clearqueue_msg")}`)
                .setColor(client.color);
            yield handler.editReply({ content: " ", embeds: [cleared] });
            (_a = client.wsl.get(handler.guild.id)) === null || _a === void 0 ? void 0 : _a.send({
                op: "playerClearQueue",
                guild: handler.guild.id,
            });
        });
    }
}
