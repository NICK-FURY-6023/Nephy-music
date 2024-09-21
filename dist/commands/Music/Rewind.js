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
const rewindNum = 10;
// Main code
export default class {
    constructor() {
        this.name = ["rewind"];
        this.description = "Rewind timestamp in the song! (10s)";
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
            const song_position = player.position;
            const CurrentDuration = new FormatDuration().parse(song_position - rewindNum * 1000);
            if (song_position - rewindNum * 1000 > 0) {
                yield player.send({
                    guildId: handler.guild.id,
                    playerOptions: {
                        position: song_position - rewindNum * 1000,
                    },
                });
                const rewind2 = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "rewind_msg", {
                    duration: CurrentDuration,
                })}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [rewind2] });
            }
            else {
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "rewind_beyond")}`)
                            .setColor(client.color),
                    ],
                });
            }
        });
    }
}
