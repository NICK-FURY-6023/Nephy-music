var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ApplicationCommandOptionType } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { ConvertTime } from "../../utilities/ConvertTime.js";
import { Accessableby } from "../../structures/Command.js";
// Main code
export default class {
    constructor() {
        this.name = ["remove"];
        this.description = "Remove song from queue.";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "<position>";
        this.aliases = ["rm"];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
        this.options = [
            {
                name: "position",
                description: "The position in queue want to remove.",
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield handler.deferReply();
            const player = client.rainlink.players.get(handler.guild.id);
            const tracks = handler.args[0];
            if (tracks && isNaN(+tracks))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
                            .setColor(client.color),
                    ],
                });
            if (Number(tracks) == 0)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "removetrack_already")}`)
                            .setColor(client.color),
                    ],
                });
            if (Number(tracks) > player.queue.length)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "removetrack_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            const song = player.queue[Number(tracks) - 1];
            player.queue.splice(Number(tracks) - 1, 1);
            const embed = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.music", "removetrack_desc", {
                name: this.getTitle(client, song),
                duration: new ConvertTime().parse(player.position),
                request: String(song.requester),
            })}`)
                .setColor(client.color);
            (_a = client.wsl.get(handler.guild.id)) === null || _a === void 0 ? void 0 : _a.send({
                op: "playerQueueRemove",
                guild: handler.guild.id,
                track: {
                    title: song.title,
                    uri: song.uri,
                    length: song.duration,
                    thumbnail: song.artworkUrl,
                    author: song.author,
                    requester: song.requester
                        ? {
                            id: song.requester.id,
                            username: song.requester.username,
                            globalName: song.requester.globalName,
                            defaultAvatarURL: (_b = song.requester.defaultAvatarURL) !== null && _b !== void 0 ? _b : null,
                        }
                        : null,
                },
                index: Number(tracks) - 1,
            });
            return handler.editReply({ embeds: [embed] });
        });
    }
    getTitle(client, tracks) {
        if (client.config.lavalink.AVOID_SUSPEND)
            return tracks.title;
        else {
            return `[${tracks.title}](${tracks.uri})`;
        }
    }
}
