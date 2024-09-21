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
// Main code
export default class {
    constructor() {
        this.name = ["skipto"];
        this.description = "Skip to a specific position";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = ["sk"];
        this.lavalink = true;
        this.options = [
            {
                name: "position",
                description: "The position of the song",
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
        ];
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
            const getPosition = Number(handler.args[0]);
            if (!handler.args[0] || isNaN(getPosition) || getPosition < 0)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
                            .setColor(client.color),
                    ],
                });
            if (player.queue.size == 0 || getPosition >= player.queue.length) {
                const skipped = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "skip_notfound")}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [skipped] });
            }
            else {
                const cuttedQueue = player.queue.splice(0, getPosition);
                const nowCurrentTrack = cuttedQueue.splice(-1)[0];
                player.queue.previous.push(...cuttedQueue);
                player.queue.current ? player.queue.previous.unshift(player.queue.current) : true;
                yield player.play(nowCurrentTrack);
                player.queue.shift();
                (_a = client.wsl.get(handler.guild.id)) === null || _a === void 0 ? void 0 : _a.send({
                    op: "playerQueueSkip",
                    guild: handler.guild.id,
                    queue: player.queue.map((track) => {
                        var _a;
                        const requesterQueue = track.requester;
                        return {
                            title: track.title,
                            uri: track.uri,
                            length: track.duration,
                            thumbnail: track.artworkUrl,
                            author: track.author,
                            requester: requesterQueue
                                ? {
                                    id: requesterQueue.id,
                                    username: requesterQueue.username,
                                    globalName: requesterQueue.globalName,
                                    defaultAvatarURL: (_a = requesterQueue.defaultAvatarURL) !== null && _a !== void 0 ? _a : null,
                                }
                                : null,
                        };
                    }),
                });
                const skipped = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "skip_msg")}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [skipped] });
            }
        });
    }
}
