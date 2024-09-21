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
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { Accessableby } from "../../structures/Command.js";
// Main code
export default class {
    constructor() {
        this.name = ["nowplaying"];
        this.description = "Display the song currently playing.";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = ["np"];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            yield handler.deferReply();
            const realtime = client.config.lavalink.NP_REALTIME;
            const player = client.rainlink.players.get(handler.guild.id);
            const song = player.queue.current;
            const position = player.position;
            const CurrentDuration = new FormatDuration().parse(position);
            const TotalDuration = new FormatDuration().parse(song.duration);
            const Thumbnail = `https://img.youtube.com/vi/${song.identifier}/maxresdefault.jpg` ||
                `https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.jpeg`;
            const Part = Math.floor((position / song.duration) * 30);
            const fieldDataGlobal = [
                {
                    name: `${client.getString(handler.language, "event.player", "author_title")}`,
                    value: `${song.author}`,
                    inline: true,
                },
                {
                    name: `${client.getString(handler.language, "event.player", "duration_title")}`,
                    value: `${new FormatDuration().parse(song.duration)}`,
                    inline: true,
                },
                {
                    name: `${client.getString(handler.language, "event.player", "volume_title")}`,
                    value: `${player.volume}%`,
                    inline: true,
                },
                {
                    name: `${client.getString(handler.language, "event.player", "queue_title")}`,
                    value: `${player.queue.length}`,
                    inline: true,
                },
                {
                    name: `${client.getString(handler.language, "event.player", "total_duration_title")}`,
                    value: `${new FormatDuration().parse(player.queue.duration)}`,
                    inline: true,
                },
                {
                    name: `${client.getString(handler.language, "event.player", "request_title")}`,
                    value: `${song.requester}`,
                    inline: true,
                },
                {
                    name: `${client.getString(handler.language, "event.player", "download_title")}`,
                    value: `**[${song.title}](https://www.000tube.com/watch?v=${song === null || song === void 0 ? void 0 : song.identifier})**`,
                    inline: false,
                },
                {
                    name: `${client.getString(handler.language, "command.music", "np_current_duration", {
                        current_duration: CurrentDuration,
                        total_duration: TotalDuration,
                    })}`,
                    value: `\`\`\`🔴 | ${"─".repeat(Part) + "🎶" + "─".repeat(30 - Part)}\`\`\``,
                    inline: false,
                },
            ];
            const embeded = new EmbedBuilder()
                .setAuthor({
                name: `${client.getString(handler.language, "command.music", "np_title")}`,
                iconURL: `${client.getString(handler.language, "command.music", "np_icon")}`,
            })
                .setColor(client.color)
                .setDescription(`**${this.getTitle(client, song)}**`)
                .setThumbnail(Thumbnail)
                .addFields(fieldDataGlobal)
                .setTimestamp();
            const NEmbed = yield handler.editReply({ content: " ", embeds: [embeded] });
            const currentNP = client.nowPlaying.get(`${(_a = handler.guild) === null || _a === void 0 ? void 0 : _a.id}`);
            if (currentNP) {
                clearInterval(currentNP.interval);
                yield ((_b = currentNP.msg) === null || _b === void 0 ? void 0 : _b.delete().catch(() => null));
                client.nowPlaying.delete(`${(_c = handler.guild) === null || _c === void 0 ? void 0 : _c.id}`);
            }
            if (realtime) {
                const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e;
                    let currentNPInterval = client.nowPlaying.get(`${(_a = handler.guild) === null || _a === void 0 ? void 0 : _a.id}`);
                    if (!currentNPInterval)
                        currentNPInterval = client.nowPlaying
                            .set(`${(_b = handler.guild) === null || _b === void 0 ? void 0 : _b.id}`, {
                            interval: interval,
                            msg: NEmbed,
                        })
                            .get(`${(_c = handler.guild) === null || _c === void 0 ? void 0 : _c.id}`);
                    if (!player.queue.current)
                        return clearInterval(interval);
                    if (!player.playing)
                        return;
                    const CurrentDuration = new FormatDuration().parse(player.position);
                    const Part = Math.floor((player.position / song.duration) * 30);
                    const editedField = fieldDataGlobal;
                    editedField.splice(7, 1);
                    editedField.push({
                        name: `${client.getString(handler.language, "command.music", "np_current_duration", {
                            current_duration: CurrentDuration,
                            total_duration: TotalDuration,
                        })}`,
                        value: `\`\`\`🔴 | ${"─".repeat(Part) + "🎶" + "─".repeat(30 - Part)}\`\`\``,
                        inline: false,
                    });
                    const embeded = new EmbedBuilder()
                        .setAuthor({
                        name: `${client.getString(handler.language, "command.music", "np_title")}`,
                        iconURL: `${client.getString(handler.language, "command.music", "np_icon")}`,
                    })
                        .setColor(client.color)
                        .setDescription(`**${this.getTitle(client, song)}**`)
                        .setThumbnail(Thumbnail)
                        .addFields(editedField)
                        .setTimestamp();
                    try {
                        const channel = (yield client.channels.fetch(`${(_d = handler.channel) === null || _d === void 0 ? void 0 : _d.id}`).catch(() => undefined));
                        if (!channel)
                            return;
                        const message = yield channel.messages.fetch(`${(_e = currentNPInterval === null || currentNPInterval === void 0 ? void 0 : currentNPInterval.msg) === null || _e === void 0 ? void 0 : _e.id}`).catch(() => undefined);
                        if (!message)
                            return;
                        if (currentNPInterval && currentNPInterval.msg)
                            currentNPInterval.msg.edit({ content: " ", embeds: [embeded] });
                    }
                    catch (err) {
                        return;
                    }
                }), 5000);
            }
            else if (!realtime) {
                if (!player.playing)
                    return;
                if (NEmbed)
                    NEmbed.edit({ content: " ", embeds: [embeded] });
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
