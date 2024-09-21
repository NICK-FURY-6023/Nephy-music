var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { Accessableby } from "../../structures/Command.js";
const time_regex = /(^[0-9][\d]{0,3}):(0[0-9]{1}$|[1-5]{1}[0-9])/;
// Main code
export default class {
    constructor() {
        this.name = ["seek"];
        this.description = "Seek timestamp in the song!";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "<time_format. Ex: 999:59>";
        this.aliases = [];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
        this.options = [
            {
                name: "time",
                description: "Set the position of the playing track. Example: 0:10 or 120:10",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            let value;
            const time = handler.args[0];
            if (!time_regex.test(time))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "seek_invalid")}`)
                            .setColor(client.color),
                    ],
                });
            else {
                const [m, s] = time.split(/:/);
                const min = Number(m) * 60;
                const sec = Number(s);
                value = min + sec;
            }
            const player = client.rainlink.players.get(handler.guild.id);
            if (value * 1000 >= player.queue.current.duration || value < 0)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "seek_beyond")}`)
                            .setColor(client.color),
                    ],
                });
            yield player.seek(value * 1000);
            const song_position = player.position;
            let final_res;
            if (song_position < value * 1000)
                final_res = song_position + value * 1000;
            else
                final_res = value * 1000;
            const Duration = new FormatDuration().parse(final_res);
            const seeked = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.music", "seek_msg", {
                duration: Duration,
            })}`)
                .setColor(client.color);
            handler.editReply({ content: " ", embeds: [seeked] });
        });
    }
}
