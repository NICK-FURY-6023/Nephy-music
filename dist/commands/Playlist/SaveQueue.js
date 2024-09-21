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
const TrackAdd = [];
const TrackExist = [];
let Result = null;
export default class {
    constructor() {
        this.name = ["pl", "savequeue"];
        this.description = "Save the current queue to a playlist";
        this.category = "Playlist";
        this.accessableby = Accessableby.Member;
        this.usage = "<playlist_id>";
        this.aliases = ["pl-sq"];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
        this.options = [
            {
                name: "id",
                description: "The id of the playlist",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield handler.deferReply();
            const value = handler.args[0] ? handler.args[0] : null;
            if (value == null)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "invalid")}`)
                            .setColor(client.color),
                    ],
                });
            const playlist = yield client.db.playlist.get(`${value}`);
            if (!playlist)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "savequeue_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            if (playlist.owner !== ((_a = handler.user) === null || _a === void 0 ? void 0 : _a.id))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "savequeue_owner")}`)
                            .setColor(client.color),
                    ],
                });
            const player = client.rainlink.players.get(handler.guild.id);
            const queue = player === null || player === void 0 ? void 0 : player.queue.map((track) => track);
            const current = player === null || player === void 0 ? void 0 : player.queue.current;
            if ((queue === null || queue === void 0 ? void 0 : queue.length) == 0 && !current)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "noplayer", "savequeue_no_tracks")}`)
                            .setColor(client.color),
                    ],
                });
            TrackAdd.push(current);
            TrackAdd.push(...queue);
            if (!playlist)
                Result = TrackAdd;
            if (playlist.tracks) {
                for (let i = 0; i < playlist.tracks.length; i++) {
                    const element = playlist.tracks[i].uri;
                    TrackExist.push(element);
                }
                Result = TrackAdd.filter((track) => !TrackExist.includes(String(track.uri)));
            }
            if (Result.length == 0) {
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.playlist", "savequeue_no_new_saved", {
                    name: value,
                })}`)
                    .setColor(client.color);
                return handler.editReply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.playlist", "savequeue_saved", {
                name: value,
                tracks: String((queue === null || queue === void 0 ? void 0 : queue.length) + 1),
            })}`)
                .setColor(client.color);
            yield handler.editReply({ embeds: [embed] });
            Result.forEach((track) => __awaiter(this, void 0, void 0, function* () {
                yield client.db.playlist.push(`${value}.tracks`, {
                    title: track.title,
                    uri: track.uri,
                    length: track.duration,
                    thumbnail: track.artworkUrl,
                    author: track.author,
                    requester: track.requester, // Just case can push
                });
            }));
            TrackAdd.length = 0;
            TrackExist.length = 0;
            Result = null;
        });
    }
}
