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
import { ConvertTime } from "../../utilities/ConvertTime.js";
import { Accessableby } from "../../structures/Command.js";
const TrackAdd = [];
export default class {
    constructor() {
        this.name = ["pl", "add"];
        this.description = "Add song to a playlist";
        this.category = "Playlist";
        this.accessableby = Accessableby.Member;
        this.usage = "<playlist_id> <url_or_name>";
        this.aliases = [];
        this.lavalink = true;
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
                name: "search",
                description: "The song link or name",
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield handler.deferReply();
            const value = handler.args[0] ? handler.args[0] : null;
            if (value == null || !value)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "invalid")}`)
                            .setColor(client.color),
                    ],
                });
            const input = handler.args[1];
            const Inputed = input;
            if (!input)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "add_match")}`)
                            .setColor(client.color),
                    ],
                });
            const result = yield client.rainlink.search(input, {
                requester: handler.user,
            });
            const tracks = result.tracks;
            if (!result.tracks.length)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "add_match")}`)
                            .setColor(client.color),
                    ],
                });
            if (result.type === "PLAYLIST")
                for (let track of tracks)
                    TrackAdd.push(track);
            else
                TrackAdd.push(tracks[0]);
            const Duration = new ConvertTime().parse(tracks[0].duration);
            const TotalDuration = tracks.reduce((acc, cur) => acc + (cur.duration || 0), (_a = tracks[0].duration) !== null && _a !== void 0 ? _a : 0);
            if (result.type === "PLAYLIST") {
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.playlist", "add_playlist", {
                    title: this.getTitle(client, result.type, tracks, Inputed),
                    duration: new ConvertTime().parse(TotalDuration),
                    track: String(tracks.length),
                    user: String(handler.user),
                })}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [embed] });
            }
            else if (result.type === "TRACK") {
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.playlist", "add_track", {
                    title: this.getTitle(client, result.type, tracks),
                    duration: Duration,
                    user: String(handler.user),
                })}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [embed] });
            }
            else if (result.type === "SEARCH") {
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.playlist", "add_search", {
                    title: this.getTitle(client, result.type, tracks),
                    duration: Duration,
                    user: String(handler.user),
                })}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [embed] });
            }
            else {
                //The playlist link is invalid.
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "add_match")}`)
                            .setColor(client.color),
                    ],
                });
            }
            const playlist = yield client.db.playlist.get(value);
            if (!playlist)
                return handler.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "invalid")}`)
                            .setColor(client.color),
                    ],
                });
            if (playlist.owner !== ((_b = handler.user) === null || _b === void 0 ? void 0 : _b.id)) {
                handler.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "add_owner")}`)
                            .setColor(client.color),
                    ],
                });
                TrackAdd.length = 0;
                return;
            }
            const LimitTrack = playlist.tracks.length + TrackAdd.length;
            if (LimitTrack > client.config.bot.LIMIT_TRACK) {
                handler.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "add_limit_track", {
                            limit: String(client.config.bot.LIMIT_TRACK),
                        })}`)
                            .setColor(client.color),
                    ],
                });
                TrackAdd.length = 0;
                return;
            }
            TrackAdd.forEach((track) => __awaiter(this, void 0, void 0, function* () {
                yield client.db.playlist.push(`${value}.tracks`, {
                    title: track.title,
                    uri: track.uri,
                    length: track.duration,
                    thumbnail: track.artworkUrl,
                    author: track.author,
                    requester: track.requester, // Just case can push
                });
            }));
            const embed = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.playlist", "add_added", {
                count: String(TrackAdd.length),
                playlist: value,
            })}`)
                .setColor(client.color);
            handler.followUp({ content: " ", embeds: [embed] });
            TrackAdd.length = 0;
        });
    }
    getTitle(client, type, tracks, value) {
        if (client.config.lavalink.AVOID_SUSPEND)
            return tracks[0].title;
        else {
            if (type === "PLAYLIST") {
                return `[${tracks[0].title}](${value})`;
            }
            else {
                return `[${tracks[0].title}](${tracks[0].uri})`;
            }
        }
    }
    // Autocomplete function
    autocomplete(client, interaction, language) {
        return __awaiter(this, void 0, void 0, function* () {
            let choice = [];
            const url = String(interaction.options.get("search").value);
            const Random = client.config.lavalink.AUTOCOMPLETE_SEARCH[Math.floor(Math.random() * client.config.lavalink.AUTOCOMPLETE_SEARCH.length)];
            const match = client.REGEX.some((match) => {
                return match.test(url) == true;
            });
            if (match == true) {
                choice.push({ name: url, value: url });
                yield interaction.respond(choice).catch(() => { });
                return;
            }
            if (client.lavalinkUsing.length == 0) {
                choice.push({
                    name: `${client.getString(language, "error", "no_node")}`,
                    value: `${client.getString(language, "error", "no_node")}`,
                });
                return;
            }
            const searchRes = yield client.rainlink.search(url || Random);
            if (searchRes.tracks.length == 0 || !searchRes.tracks) {
                return choice.push({ name: "Error song not matches", value: url });
            }
            for (let i = 0; i < 10; i++) {
                const x = searchRes.tracks[i];
                choice.push({
                    name: x && x.title ? x.title : "Unknown track name",
                    value: x && x.uri ? x.uri : url,
                });
            }
            yield interaction.respond(choice).catch(() => { });
        });
    }
}
