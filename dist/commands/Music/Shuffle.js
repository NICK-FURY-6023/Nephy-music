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
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { PageQueue } from "../../structures/PageQueue.js";
// Main code
export default class {
    constructor() {
        this.name = ["shuffle"];
        this.description = "Shuffle song in queue!";
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
            const newQueue = yield player.queue.shuffle();
            const song = newQueue.current;
            const qduration = `${new FormatDuration().parse(song.duration + player.queue.duration)}`;
            const thumbnail = `https://img.youtube.com/vi/${song.identifier}/hqdefault.jpg`;
            let pagesNum = Math.ceil(newQueue.length / 10);
            if (pagesNum === 0)
                pagesNum = 1;
            const songStrings = [];
            for (let i = 0; i < newQueue.length; i++) {
                const song = newQueue[i];
                songStrings.push(`**${i + 1}.** ${this.getTitle(client, song)} \`[${new FormatDuration().parse(song.duration)}]\`
                    `);
            }
            const pages = [];
            for (let i = 0; i < pagesNum; i++) {
                const str = songStrings.slice(i * 10, i * 10 + 10).join("");
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.getString(handler.language, "command.music", "shuffle_msg")}`,
                })
                    .setThumbnail(thumbnail)
                    .setColor(client.color)
                    .setDescription(`${client.getString(handler.language, "command.music", "queue_description", {
                    title: this.getTitle(client, song),
                    request: String(song.requester),
                    duration: new FormatDuration().parse(song.duration),
                    rest: str == "" ? "  Nothing" : "\n" + str,
                })}`)
                    .setFooter({
                    text: `${client.getString(handler.language, "command.music", "queue_footer", {
                        page: String(i + 1),
                        pages: String(pagesNum),
                        queue_lang: String(newQueue.length),
                        duration: qduration,
                    })}`,
                });
                pages.push(embed);
            }
            (_a = client.wsl.get(handler.guild.id)) === null || _a === void 0 ? void 0 : _a.send({
                op: "playerQueueShuffle",
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
            if (pages.length == pagesNum && newQueue.length > 10) {
                if (handler.message) {
                    yield new PageQueue(client, pages, 60000, newQueue.length, handler.language).prefixPage(handler.message, qduration);
                }
                else if (handler.interaction) {
                    yield new PageQueue(client, pages, 60000, newQueue.length, handler.language).slashPage(handler.interaction, qduration);
                }
                else
                    return;
            }
            else
                return handler.editReply({ embeds: [pages[0]] });
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
