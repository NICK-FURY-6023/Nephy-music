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
import { ConvertTime } from "../../utilities/ConvertTime.js";
import { Accessableby } from "../../structures/Command.js";
// Main code
export default class {
    constructor() {
        this.name = ["file"];
        this.description = "Play the music file for the bot";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = ["file", "f"];
        this.lavalink = true;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: "type",
                description: "The music file to play",
                type: ApplicationCommandOptionType.Attachment,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            yield handler.deferReply();
            let player = client.rainlink.players.get(handler.guild.id);
            const file = handler.attactments[0];
            if (!file)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "file_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            const { channel } = handler.member.voice;
            if (!channel)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "no_in_voice")}`)
                            .setColor(client.color),
                    ],
                });
            if (file.contentType !== "audio/mpeg" && file.contentType !== "audio/ogg")
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "play_invalid_file")}`)
                            .setColor(client.color),
                    ],
                });
            if (!file.contentType)
                handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "play_warning_file")}`)
                            .setColor(client.color),
                    ],
                });
            if (!player)
                player = yield client.rainlink.create({
                    guildId: handler.guild.id,
                    voiceId: handler.member.voice.channel.id,
                    textId: handler.channel.id,
                    shardId: (_b = (_a = handler.guild) === null || _a === void 0 ? void 0 : _a.shardId) !== null && _b !== void 0 ? _b : 0,
                    deaf: true,
                    volume: (_c = client.config.lavalink.DEFAULT_VOLUME) !== null && _c !== void 0 ? _c : 100,
                });
            const result = yield player.search(file.url, {
                requester: handler.user,
            });
            const tracks = result.tracks;
            if (!result.tracks.length)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "play_match")}`)
                            .setColor(client.color),
                    ],
                });
            if (result.type === "PLAYLIST")
                for (let track of tracks)
                    player.queue.add(track);
            else if (player.playing && result.type === "SEARCH")
                player.queue.add(tracks[0]);
            else if (player.playing && result.type !== "SEARCH")
                for (let track of tracks)
                    player.queue.add(track);
            else
                player.queue.add(tracks[0]);
            const TotalDuration = player.queue.duration;
            if (handler.message)
                yield handler.message.delete().catch(() => null);
            if (result.type === "PLAYLIST") {
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "play_playlist", {
                    title: file.name,
                    duration: new ConvertTime().parse(TotalDuration),
                    songs: String(tracks.length),
                    request: String(tracks[0].requester),
                })}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [embed] });
                if (!player.playing)
                    player.play();
            }
            else if (result.type === "TRACK") {
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "play_track", {
                    title: file.name,
                    duration: new ConvertTime().parse(tracks[0].duration),
                    request: String(tracks[0].requester),
                })}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [embed] });
                if (!player.playing)
                    player.play();
            }
            else if (result.type === "SEARCH") {
                const embed = new EmbedBuilder().setColor(client.color).setDescription(`${client.getString(handler.language, "command.music", "play_result", {
                    title: file.name,
                    duration: new ConvertTime().parse(tracks[0].duration),
                    request: String(tracks[0].requester),
                })}`);
                handler.editReply({ content: " ", embeds: [embed] });
                if (!player.playing)
                    player.play();
            }
            else {
                handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "play_match")}`)
                            .setColor(client.color),
                    ],
                });
                player.data.set("sudo-destroy", true);
                const is247 = yield client.db.autoreconnect.get(`${(_d = handler.guild) === null || _d === void 0 ? void 0 : _d.id}`);
                player.stop(is247 && is247.twentyfourseven ? false : true);
            }
        });
    }
}
