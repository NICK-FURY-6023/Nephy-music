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
import { ConvertTime } from "../../utilities/ConvertTime.js";
// Button Commands
import { ButtonPrevious } from "./ButtonCommands/Previous.js";
import { ButtonSkip } from "./ButtonCommands/Skip.js";
import { ButtonStop } from "./ButtonCommands/Stop.js";
import { ButtonLoop } from "./ButtonCommands/Loop.js";
import { ButtonPause } from "./ButtonCommands/Pause.js";
import { RateLimitManager } from "@sapphire/ratelimits";
const rateLimitManager = new RateLimitManager(2000);
/**
 * @param {Client} client
 */
export class playerLoadContent {
    constructor(client) {
        this.client = client;
        this.register();
    }
    register() {
        try {
            this.client.on("interactionCreate", this.interaction.bind(null, this.client));
            this.client.on("messageCreate", this.message.bind(null, this.client));
        }
        catch (err) {
            this.client.logger.error(import.meta.url, err);
        }
    }
    interaction(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.guild || interaction.user.bot)
                return;
            if (!interaction.isButton())
                return;
            const { customId, member } = interaction;
            let voiceMember = yield interaction.guild.members.fetch(member.id).catch(() => undefined);
            let channel = voiceMember.voice.channel;
            let player = client.rainlink.players.get(interaction.guild.id);
            if (!player)
                return;
            const playChannel = yield client.channels.fetch(player.textId).catch(() => undefined);
            if (!playChannel)
                return;
            let guildModel = yield client.db.language.get(`${player.guildId}`);
            if (!guildModel) {
                guildModel = yield client.db.language.set(`${player.guildId}`, client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            switch (customId) {
                case "sprevious":
                    new ButtonPrevious(client, interaction, channel, language, player);
                    break;
                case "sskip":
                    new ButtonSkip(client, interaction, channel, language, player);
                    break;
                case "sstop":
                    new ButtonStop(client, interaction, channel, language, player);
                    break;
                case "sloop":
                    new ButtonLoop(client, interaction, language, player);
                    break;
                case "spause":
                    new ButtonPause(client, interaction, channel, language, player);
                    break;
                default:
                    break;
            }
        });
    }
    message(client, message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!message.guild || !message.guild.available || !message.channel.isTextBased())
                return;
            let database = yield client.db.setup.get(`${message.guild.id}`);
            let player = client.rainlink.players.get(`${message.guild.id}`);
            if (!database)
                return;
            if (!database.enable)
                return;
            let channel = (yield message.guild.channels.fetch(database.channel).catch(() => undefined));
            if (!channel)
                return;
            if (database.channel != message.channel.id)
                return;
            let guildModel = yield client.db.language.get(`${message.guild.id}`);
            if (!guildModel) {
                guildModel = yield client.db.language.set(`${message.guild.id}`, client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            if (message.id !== database.playmsg) {
                const preInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    const fetchedMessage = yield message.channel.messages.fetch({ limit: 50 }).catch(() => undefined);
                    if (!fetchedMessage) {
                        clearInterval(preInterval);
                        return;
                    }
                    const final = fetchedMessage.filter((msg) => msg.id !== (database === null || database === void 0 ? void 0 : database.playmsg));
                    if (final.size > 0)
                        message.channel.bulkDelete(final).catch(() => { });
                    else
                        clearInterval(preInterval);
                }), client.config.bot.DELETE_MSG_TIMEOUT);
            }
            if (message.author.bot)
                return;
            const song = message.cleanContent;
            if (!song)
                return;
            const ratelimit = rateLimitManager.acquire(message.author.id);
            if (ratelimit.limited)
                return;
            ratelimit.consume();
            let voiceChannel = yield message.member.voice.channel;
            if (!voiceChannel)
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "error", "no_in_voice")}`)
                            .setColor(client.color),
                    ],
                });
            let msg = yield message.channel.messages.fetch(database.playmsg).catch(() => undefined);
            const emotes = (str) => str.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu);
            if (emotes(song) !== null) {
                msg === null || msg === void 0 ? void 0 : msg.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "event.setup", "play_emoji")}`)
                            .setColor(client.color),
                    ],
                });
                return;
            }
            if (!player)
                player = yield client.rainlink.create({
                    guildId: message.guild.id,
                    voiceId: message.member.voice.channel.id,
                    textId: message.channel.id,
                    shardId: message.guild.shardId,
                    deaf: true,
                    volume: (_a = client.config.lavalink.DEFAULT_VOLUME) !== null && _a !== void 0 ? _a : 100,
                });
            else {
                if (message.member.voice.channel !== message.guild.members.me.voice.channel) {
                    msg === null || msg === void 0 ? void 0 : msg.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(language, "error", "no_same_voice")}`)
                                .setColor(client.color),
                        ],
                    });
                    return;
                }
            }
            const result = yield player.search(song, { requester: message.author });
            const tracks = result.tracks;
            if (!result.tracks.length) {
                msg === null || msg === void 0 ? void 0 : msg.edit({
                    content: `${client.getString(language, "event.setup", "setup_content")}\n${`${client.getString(language, "event.setup", "setup_content_empty")}`}`,
                });
                return;
            }
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
            if (result.type === "PLAYLIST") {
                if (!player.playing)
                    player.play();
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(language, "event.setup", "play_playlist", {
                    title: getTitle(result.tracks),
                    duration: new ConvertTime().parse(TotalDuration),
                    songs: `${result.tracks.length}`,
                    request: `${result.tracks[0].requester}`,
                })}`)
                    .setColor(client.color);
                msg === null || msg === void 0 ? void 0 : msg.reply({ content: " ", embeds: [embed] });
            }
            else if (result.type === "TRACK") {
                if (!player.playing)
                    player.play();
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(language, "event.setup", "play_track", {
                    title: getTitle(result.tracks),
                    duration: new ConvertTime().parse(result.tracks[0].duration),
                    request: `${result.tracks[0].requester}`,
                })}`)
                    .setColor(client.color);
                msg === null || msg === void 0 ? void 0 : msg.reply({ content: " ", embeds: [embed] });
            }
            else if (result.type === "SEARCH") {
                if (!player.playing)
                    player.play();
                const embed = new EmbedBuilder().setColor(client.color).setDescription(`${client.getString(language, "event.setup", "play_result", {
                    title: getTitle(result.tracks),
                    duration: new ConvertTime().parse(result.tracks[0].duration),
                    request: `${result.tracks[0].requester}`,
                })}`);
                msg === null || msg === void 0 ? void 0 : msg.reply({ content: " ", embeds: [embed] });
            }
            function getTitle(tracks) {
                if (client.config.lavalink.AVOID_SUSPEND)
                    return tracks[0].title;
                else {
                    return `[${tracks[0].title}](${tracks[0].uri})`;
                }
            }
            yield client.UpdateQueueMsg(player);
        });
    }
}
