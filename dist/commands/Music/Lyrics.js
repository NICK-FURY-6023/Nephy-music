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
import { Accessableby } from "../../structures/Command.js";
import { Lyricist } from "@execaman/lyricist";
// Main code
export default class {
    constructor() {
        this.name = ["lyrics"];
        this.description = "Make the bot join the voice channel.";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "Display lyrics of the song";
        this.aliases = ["ly"];
        this.lavalink = true;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: "search",
                description: "The song name",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const lyrics = new Lyricist({
                plugins: [],
                saveLastResult: false,
            });
            // Keep it short, around 30
            // characters in length
            let lyricsRes = null;
            const query = handler.args.join(" ");
            try {
                const result = yield lyrics.fetch(query, 3);
                lyricsRes = result.lyrics;
                if (!lyricsRes)
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(handler.language, "command.music", "lyrics_notfound")}`)
                                .setColor(client.color),
                        ],
                    });
            }
            catch (err) {
                console.log(err);
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "lyrics_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            }
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle(`${client.getString(handler.language, "command.music", "lyrics_title", {
                song: query,
            })}`)
                .setDescription(`${lyricsRes}`)
                .setTimestamp();
            if (lyricsRes.length > 4096) {
                embed.setDescription(`${client.getString(handler.language, "command.music", "lyrics_toolong")}`);
            }
            return handler.editReply({ embeds: [embed] });
        });
    }
}
