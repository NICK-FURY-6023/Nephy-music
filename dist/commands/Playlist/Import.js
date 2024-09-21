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
let playlist;
export default class {
    constructor() {
        this.name = ["pl", "import"];
        this.description = "Import a playlist to queue.";
        this.category = "Playlist";
        this.accessableby = Accessableby.Member;
        this.usage = "<playlist_id>";
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
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
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
            if (value) {
                playlist = yield client.db.playlist.get(`${value}`);
            }
            if (!playlist)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "invalid")}`)
                            .setColor(client.color),
                    ],
                });
            if (playlist.private && playlist.owner !== ((_a = handler.user) === null || _a === void 0 ? void 0 : _a.id)) {
                handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "import_private")}`)
                            .setColor(client.color),
                    ],
                });
                return;
            }
            const { channel } = handler.member.voice;
            if (!channel)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "import_voice")}`)
                            .setColor(client.color),
                    ],
                });
            const SongAdd = [];
            let SongLoad = 0;
            const totalDuration = new ConvertTime().parse(playlist.tracks.reduce((acc, cur) => acc + cur.length, 0));
            if (((_b = playlist.tracks) === null || _b === void 0 ? void 0 : _b.length) == 0)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "import_empty")}`)
                            .setColor(client.color),
                    ],
                });
            const player = yield client.rainlink.create({
                guildId: handler.guild.id,
                voiceId: handler.member.voice.channel.id,
                textId: handler.channel.id,
                shardId: (_d = (_c = handler.guild) === null || _c === void 0 ? void 0 : _c.shardId) !== null && _d !== void 0 ? _d : 0,
                deaf: true,
                volume: (_e = client.config.lavalink.DEFAULT_VOLUME) !== null && _e !== void 0 ? _e : 100,
            });
            for (let i = 0; i < playlist.tracks.length; i++) {
                const res = yield player.search(playlist.tracks[i].uri, {
                    requester: handler.user,
                });
                if (res.type == "TRACK") {
                    SongAdd.push(res.tracks[0]);
                    SongLoad++;
                }
                else if (res.type == "PLAYLIST") {
                    for (let t = 0; t < res.tracks.length; t++) {
                        SongAdd.push(res.tracks[t]);
                        SongLoad++;
                    }
                }
                else if (res.type == "SEARCH") {
                    SongAdd.push(res.tracks[0]);
                    SongLoad++;
                }
                if (SongLoad == playlist.tracks.length) {
                    player.queue.add(SongAdd);
                    const embed = new EmbedBuilder() // **Imported • \`${Plist}\`** (${playlist.tracks.length} tracks) • ${message.author}
                        .setDescription(`${client.getString(handler.language, "command.playlist", "import_imported", {
                        name: playlist.name,
                        tracks: String(playlist.tracks.length),
                        duration: totalDuration,
                        user: String(handler.user),
                    })}`)
                        .setColor(client.color);
                    handler.editReply({ content: " ", embeds: [embed] });
                    if (!player.playing) {
                        player.play();
                    }
                }
            }
        });
    }
}
