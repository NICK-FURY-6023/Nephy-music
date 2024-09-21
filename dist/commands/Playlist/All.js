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
import { PageQueue } from "../../structures/PageQueue.js";
import humanizeDuration from "humanize-duration";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["pl", "all"];
        this.description = "View all your playlists";
        this.category = "Playlist";
        this.accessableby = Accessableby.Member;
        this.usage = "<number>";
        this.aliases = [];
        this.lavalink = false;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
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
            var _a;
            yield handler.deferReply();
            const number = handler.args[0];
            const playlists = [];
            const fullList = yield client.db.playlist.all();
            fullList
                .filter((data) => {
                var _a;
                return data.value.owner == ((_a = handler.user) === null || _a === void 0 ? void 0 : _a.id);
            })
                .forEach((data) => {
                playlists.push(data.value);
            });
            let pagesNum = Math.ceil(playlists.length / 10);
            if (pagesNum === 0)
                pagesNum = 1;
            const playlistStrings = [];
            for (let i = 0; i < playlists.length; i++) {
                const playlist = playlists[i];
                const created = humanizeDuration(Date.now() - playlists[i].created, {
                    largest: 1,
                });
                playlistStrings.push(`${client.getString(handler.language, "command.playlist", "view_embed_playlist", {
                    num: String(i + 1),
                    name: playlist.id,
                    tracks: String(playlist.tracks.length),
                    create: created,
                })}
                `);
            }
            const pages = [];
            for (let i = 0; i < pagesNum; i++) {
                const str = playlistStrings.slice(i * 10, i * 10 + 10).join(`\n`);
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.getString(handler.language, "command.playlist", "view_embed_title", {
                        user: handler.user.username,
                    })}`,
                    iconURL: (_a = handler.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL(),
                })
                    .setDescription(`${str == "" ? "  Nothing" : "\n" + str}`)
                    .setColor(client.color)
                    .setFooter({
                    text: `${client.getString(handler.language, "command.playlist", "view_embed_footer", {
                        page: String(i + 1),
                        pages: String(pagesNum),
                        songs: String(playlists.length),
                    })}`,
                });
                pages.push(embed);
            }
            if (!number) {
                if (pages.length == pagesNum && playlists.length > 10) {
                    if (handler.message) {
                        yield new PageQueue(client, pages, 30000, playlists.length, handler.language).prefixPlaylistPage(handler.message);
                    }
                    else if (handler.interaction) {
                        yield new PageQueue(client, pages, 30000, playlists.length, handler.language).slashPlaylistPage(handler.interaction);
                    }
                    return (playlists.length = 0);
                }
                else {
                    yield handler.editReply({ embeds: [pages[0]] });
                    return (playlists.length = 0);
                }
            }
            else {
                if (isNaN(+number))
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(handler.language, "command.playlist", "view_notnumber")}`)
                                .setColor(client.color),
                        ],
                    });
                if (Number(number) > pagesNum)
                    return handler.editReply({
                        content: `${client.getString(handler.language, "command.playlist", "view_page_notfound", {
                            page: String(pagesNum),
                        })}`,
                    });
                const pageNum = Number(number) == 0 ? 1 : Number(number) - 1;
                yield handler.editReply({ embeds: [pages[pageNum]] });
                return (playlists.length = 0);
            }
        });
    }
}
