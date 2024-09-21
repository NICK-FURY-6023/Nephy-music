var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { PageQueue } from "../../structures/PageQueue.js";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["pl", "detail"];
        this.description = "View all your playlists";
        this.category = "Playlist";
        this.accessableby = Accessableby.Member;
        this.usage = "<playlist_id> <number>";
        this.aliases = [];
        this.lavalink = false;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: "id",
                description: "The id of the playlist",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
            {
                name: "page",
                description: "The page you want to view",
                required: false,
                type: ApplicationCommandOptionType.Integer,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield handler.deferReply();
            const value = handler.args[0] ? handler.args[0] : null;
            const number = handler.args[1];
            if (number && isNaN(+number))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
                            .setColor(client.color),
                    ],
                });
            if (!value)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "detail_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            const playlist = yield client.db.playlist.get(value);
            if (!playlist)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "detail_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            if (playlist.private && playlist.owner !== ((_a = handler.user) === null || _a === void 0 ? void 0 : _a.id))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "detail_private")}`)
                            .setColor(client.color),
                    ],
                });
            let pagesNum = Math.ceil(playlist.tracks.length / 10);
            if (pagesNum === 0)
                pagesNum = 1;
            const playlistStrings = [];
            for (let i = 0; i < playlist.tracks.length; i++) {
                const playlists = playlist.tracks[i];
                playlistStrings.push(`${client.getString(handler.language, "command.playlist", "detail_track", {
                    num: String(i + 1),
                    title: this.getTitle(client, playlists),
                    author: String(playlists.author),
                    duration: new FormatDuration().parse(playlists.length),
                })}
                `);
            }
            const totalDuration = new FormatDuration().parse(playlist.tracks.reduce((acc, cur) => acc + cur.length, 0));
            const pages = [];
            for (let i = 0; i < pagesNum; i++) {
                const str = playlistStrings.slice(i * 10, i * 10 + 10).join(`\n`);
                const embed = new EmbedBuilder() //${playlist.name}'s Playlists
                    .setAuthor({
                    name: `${client.getString(handler.language, "command.playlist", "detail_embed_title", {
                        name: playlist.name,
                    })}`,
                    iconURL: (_b = handler.user) === null || _b === void 0 ? void 0 : _b.displayAvatarURL(),
                })
                    .setDescription(`${str == "" ? "  Nothing" : "\n" + str}`)
                    .setColor(client.color) //Page • ${i + 1}/${pagesNum} | ${playlist.tracks.length} • Songs | ${totalDuration} • Total duration
                    .setFooter({
                    text: `${client.getString(handler.language, "command.playlist", "detail_embed_footer", {
                        page: String(i + 1),
                        pages: String(pagesNum),
                        songs: String(playlist.tracks.length),
                        duration: totalDuration,
                    })}`,
                });
                pages.push(embed);
            }
            if (!number) {
                if (pages.length == pagesNum && playlist.tracks.length > 10) {
                    if (handler.message) {
                        yield new PageQueue(client, pages, 30000, playlist.tracks.length, handler.language).prefixPage(handler.message, totalDuration);
                    }
                    else if (handler.interaction) {
                        yield new PageQueue(client, pages, 30000, playlist.tracks.length, handler.language).slashPage(handler.interaction, totalDuration);
                    }
                }
                else
                    return handler.editReply({ embeds: [pages[0]] });
            }
            else {
                if (isNaN(+number))
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(handler.language, "command.playlist", "detail_notnumber")}`)
                                .setColor(client.color),
                        ],
                    });
                if (Number(number) > pagesNum)
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(handler.language, "command.playlist", "detail_page_notfound", {
                                page: String(pagesNum),
                            })}`)
                                .setColor(client.color),
                        ],
                    });
                const pageNum = Number(number) == 0 ? 1 : Number(number) - 1;
                return handler.editReply({ embeds: [pages[pageNum]] });
            }
        });
    }
    getTitle(client, tracks) {
        if (client.config.lavalink.AVOID_SUSPEND)
            return String(tracks.title);
        else {
            return `[${tracks.title}](${tracks.uri})`;
        }
    }
}
