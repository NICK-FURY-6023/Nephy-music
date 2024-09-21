var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ComponentType } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { playerRowOne, playerRowTwo } from "../../assets/PlayerControlButton.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { SongNotiEnum } from "../../database/schema/SongNoti.js";
export default class {
    execute(client, player, track) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!client.isDatabaseConnected)
                return client.logger.warn(import.meta.url, "The database is not yet connected so this event will temporarily not execute. Please try again later!");
            const guild = yield client.guilds.fetch(player.guildId).catch(() => undefined);
            client.logger.info(import.meta.url, `Player Started in @ ${guild.name} / ${player.guildId}`);
            let SongNoti = yield client.db.songNoti.get(`${player.guildId}`);
            if (!SongNoti)
                SongNoti = yield client.db.songNoti.set(`${player.guildId}`, SongNotiEnum.Enable);
            if (!player)
                return;
            /////////// Update Music Setup ///////////
            yield client.UpdateQueueMsg(player);
            /////////// Update Music Setup ///////////
            const channel = (yield client.channels.fetch(player.textId).catch(() => undefined));
            if (!channel)
                return;
            client.emit("trackStart", player);
            const autoreconnect = new AutoReconnectBuilderService(client, player);
            if (yield autoreconnect.get(player.guildId)) {
                yield client.db.autoreconnect.set(`${player.guildId}.current`, (_a = player.queue.current) === null || _a === void 0 ? void 0 : _a.uri);
                yield client.db.autoreconnect.set(`${player.guildId}.config.loop`, player.loop);
                function queueUri() {
                    const res = [];
                    for (let data of player.queue) {
                        res.push(data.uri);
                    }
                    return res.length !== 0 ? res : [];
                }
                function previousUri() {
                    const res = [];
                    for (let data of player.queue.previous) {
                        res.push(data.uri);
                    }
                    return res.length !== 0 ? res : [];
                }
                yield client.db.autoreconnect.set(`${player.guildId}.queue`, queueUri());
                yield client.db.autoreconnect.set(`${player.guildId}.previous`, previousUri());
            }
            else {
                yield autoreconnect.playerBuild(player.guildId);
            }
            let data = yield client.db.setup.get(`${channel.guild.id}`);
            if (data && player.textId === data.channel)
                return;
            let guildModel = yield client.db.language.get(`${channel.guild.id}`);
            if (!guildModel) {
                guildModel = yield client.db.language.set(`${channel.guild.id}`, client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            const song = player.queue.current;
            if (SongNoti == SongNotiEnum.Disable)
                return;
            function getTitle(tracks) {
                if (client.config.lavalink.AVOID_SUSPEND)
                    return tracks.title;
                else {
                    return `[${tracks.title}](${tracks.uri})`;
                }
            }
            const embeded = new EmbedBuilder()
                .setAuthor({
                name: `${client.getString(language, "event.player", "track_title")}`,
                iconURL: `${client.getString(language, "event.player", "track_icon")}`,
            })
                .setDescription(`**${getTitle(track)}**`)
                .addFields([
                {
                    name: `${client.getString(language, "event.player", "author_title")}`,
                    value: `${song.author}`,
                    inline: true,
                },
                {
                    name: `${client.getString(language, "event.player", "duration_title")}`,
                    value: `${new FormatDuration().parse(song.duration)}`,
                    inline: true,
                },
                {
                    name: `${client.getString(language, "event.player", "request_title")}`,
                    value: `${song.requester}`,
                    inline: true,
                },
                {
                    name: `${client.getString(language, "event.player", "download_title")}`,
                    value: `**[${song.title} - 000tube.com](https://www.000tube.com/watch?v=${song === null || song === void 0 ? void 0 : song.identifier})**`,
                    inline: false,
                },
            ])
                .setColor(client.color)
                .setThumbnail(`https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`)
                .setTimestamp();
            const playing_channel = (yield client.channels.fetch(player.textId).catch(() => undefined));
            const nplaying = playing_channel
                ? yield playing_channel.send({
                    embeds: [embeded],
                    components: [playerRowOne, playerRowTwo],
                    // files: client.config.bot.SAFE_PLAYER_MODE ? [] : [attachment],
                })
                : undefined;
            if (!nplaying)
                return;
            const collector = nplaying.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter: (message) => {
                    if (message.guild.members.me.voice.channel &&
                        message.guild.members.me.voice.channelId === message.member.voice.channelId)
                        return true;
                    else {
                        message.reply({
                            content: `${client.getString(language, "event.player", "join_voice")}`,
                            ephemeral: true,
                        });
                        return false;
                    }
                },
            });
            client.nplayingMsg.set(player.guildId, { coll: collector, msg: nplaying });
            collector.on("collect", (message) => __awaiter(this, void 0, void 0, function* () {
                const id = message.customId;
                const button = client.plButton.get(id);
                const language = guildModel;
                if (button) {
                    try {
                        button.run(client, message, String(language), player, nplaying, collector);
                    }
                    catch (err) {
                        client.logger.error(import.meta.url, err);
                    }
                }
            }));
            collector.on("end", () => {
                collector.removeAllListeners();
            });
        });
    }
}
