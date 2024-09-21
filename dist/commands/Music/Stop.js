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
        this.name = ["stop"];
        this.description = "Stop music and make the bot leave the voice channel.";
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
            var _a;
            yield handler.deferReply();
            const player = client.rainlink.players.get(handler.guild.id);
            const { channel } = handler.member.voice;
            player.data.set("sudo-destroy", true);
            const is247 = yield client.db.autoreconnect.get(`${(_a = handler.guild) === null || _a === void 0 ? void 0 : _a.id}`);
            player.stop(is247 && is247.twentyfourseven ? false : true);
            const embed = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.music", "stop_msg", {
                channel: channel.name,
            })}`)
                .setColor(client.color);
            yield handler.editReply({ content: " ", embeds: [embed] });
        });
    }
}
