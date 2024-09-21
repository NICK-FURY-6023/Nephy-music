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
import { PageQueue } from "../../structures/PageQueue.js";
import { Accessableby } from "../../structures/Command.js";
// Main code
export default class {
    constructor() {
        this.name = ["queue"];
        this.description = "Show the queue of songs.";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "<page_number>";
        this.aliases = [];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
        this.options = [
            {
                name: "page",
                description: "Page number to show.",
                type: ApplicationCommandOptionType.Number,
                required: false,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const value = handler.args[0];
            if (value && isNaN(+value))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
                            .setColor(client.color),
                    ],
                });
            const player = client.rainlink.players.get(handler.guild.id);
            const song = player.queue.current;
            const qduration = `${new FormatDuration().parse(song.duration + player.queue.duration)}`;
            const thumbnail = `https://img.youtube.com/vi/${song.identifier}/hqdefault.jpg`;
            let pagesNum = Math.ceil(player.queue.length / 10);
            if (pagesNum === 0)
                pagesNum = 1;
            const songStrings = [];
            for (let i = 0; i < player.queue.length; i++) {
                const song = player.queue[i];
                songStrings.push(`**${i + 1}.** ${this.getTitle(client, song)} \`[${new FormatDuration().parse(song.duration)}]\``);
            }
            const pages = [];
            for (let i = 0; i < pagesNum; i++) {
                const str = songStrings.slice(i * 10, i * 10 + 10).join("\n");
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.getString(handler.language, "command.music", "queue_author", {
                        guild: handler.guild.name,
                    })}`,
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
                        queue_lang: String(player.queue.length),
                        duration: qduration,
                    })}`,
                });
                pages.push(embed);
            }
            if (!value) {
                if (pages.length == pagesNum && player.queue.length > 10) {
                    if (handler.message) {
                        yield new PageQueue(client, pages, 60000, player.queue.length, handler.language).prefixPage(handler.message, qduration);
                    }
                    else if (handler.interaction) {
                        yield new PageQueue(client, pages, 60000, player.queue.length, handler.language).slashPage(handler.interaction, qduration);
                    }
                    else
                        return;
                }
                else
                    return handler.editReply({ embeds: [pages[0]] });
            }
            else {
                if (isNaN(+value))
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(handler.language, "command.music", "queue_notnumber")}`)
                                .setColor(client.color),
                        ],
                    });
                if (Number(value) > pagesNum)
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(handler.language, "command.music", "queue_page_notfound", {
                                page: String(pagesNum),
                            })}`)
                                .setColor(client.color),
                        ],
                    });
                const pageNum = Number(value) == 0 ? 1 : Number(value) - 1;
                return handler.editReply({ embeds: [pages[pageNum]] });
            }
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
