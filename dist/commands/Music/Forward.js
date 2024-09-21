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
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { Accessableby } from "../../structures/Command.js";
const fastForwardNum = 10;
// Main code
export default class {
    constructor() {
        this.name = ["forward"];
        this.description = "Forward timestamp in the song! (10s)";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = [];
        this.lavalink = true;
        this.options = [];
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const player = client.rainlink.players.get(handler.guild.id);
            const song = player.queue.current;
            const song_position = player.position;
            const CurrentDuration = new FormatDuration().parse(song_position + fastForwardNum * 1000);
            if (song_position + fastForwardNum * 1000 < song.duration) {
                player.send({
                    guildId: handler.guild.id,
                    playerOptions: {
                        position: song_position + fastForwardNum * 1000,
                    },
                });
                const forward2 = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "forward_msg", {
                    duration: CurrentDuration,
                })}`)
                    .setColor(client.color);
                yield handler.editReply({ content: " ", embeds: [forward2] });
            }
            else {
                return yield handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "forward_beyond")}`)
                            .setColor(client.color),
                    ],
                });
            }
        });
    }
}
