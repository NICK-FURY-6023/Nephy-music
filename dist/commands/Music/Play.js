var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ApplicationCommandOptionType, EmbedBuilder, } from 'discord.js';
import { convertTime } from '../../utilities/ConvertTime.js';
import { Accessableby } from '../../structures/Command.js';
export default class {
    constructor() {
        this.name = ['play'];
        this.description = 'Play a song from any types';
        this.category = 'Music';
        this.accessableby = [Accessableby.Member];
        this.usage = '<name_or_url>';
        this.aliases = ['p', 'pl', 'pp'];
        this.lavalink = true;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: 'search',
                description: 'The song link or name',
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
            let player = client.rainlink.players.get(handler.guild.id);
            const value = handler.args.join(' ');
            const maxLength = yield client.db.maxlength.get(handler.user.id);
            if (!value)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'command.music', 'play_arg')}`)
                            .setColor(client.color),
                    ],
                });
            const { channel } = handler.member.voice;
            if (!channel)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'error', 'no_in_voice')}`)
                            .setColor(client.color),
                    ],
                });
            const emotes = (str) => str.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu);
            if (emotes(value) !== null)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'command.music', 'play_emoji')}`)
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
                    volume: client.config.player.DEFAULT_VOLUME,
                });
            else if (player && !this.checkSameVoice(client, handler, handler.language)) {
                return;
            }
            player.textId = handler.channel.id;
            const result = yield player.search(value, { requester: handler.user });
            const tracks = result.tracks.filter((e) => typeof maxLength !== 'string' ? e.duration > maxLength : e);
            if (!result.tracks.length)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'command.music', 'play_match')}`)
                            .setColor(client.color),
                    ],
                });
            if (result.type === 'PLAYLIST')
                for (let track of tracks)
                    player.queue.add(track);
            else if (player.playing && result.type === 'SEARCH')
                player.queue.add(tracks[0]);
            else if (player.playing && result.type !== 'SEARCH')
                for (let track of tracks)
                    player.queue.add(track);
            else
                player.queue.add(tracks[0]);
            const TotalDuration = player.queue.duration;
            if (handler.message)
                yield handler.message.delete().catch(() => null);
            if (!player.playing)
                player.play();
            if (result.type === 'TRACK') {
                const embed = new EmbedBuilder()
                    .setDescription(`${client.i18n.get(handler.language, 'command.music', 'play_track', {
                    title: this.getTitle(client, result.type, tracks),
                    duration: convertTime(tracks[0].duration),
                    request: String(tracks[0].requester),
                })}`)
                    .setColor(client.color);
                handler.editReply({ content: ' ', embeds: [embed] });
            }
            else if (result.type === 'PLAYLIST') {
                const embed = new EmbedBuilder()
                    .setDescription(`${client.i18n.get(handler.language, 'command.music', 'play_playlist', {
                    title: this.getTitle(client, result.type, tracks, value),
                    duration: convertTime(TotalDuration),
                    songs: String(tracks.length),
                    request: String(tracks[0].requester),
                })}`)
                    .setColor(client.color);
                handler.editReply({ content: ' ', embeds: [embed] });
            }
            else if (result.type === 'SEARCH') {
                const embed = new EmbedBuilder().setColor(client.color).setDescription(`${client.i18n.get(handler.language, 'command.music', 'play_result', {
                    title: this.getTitle(client, result.type, tracks),
                    duration: convertTime(tracks[0].duration),
                    request: String(tracks[0].requester),
                })}`);
                handler.editReply({ content: ' ', embeds: [embed] });
            }
        });
    }
    checkSameVoice(client, handler, language) {
        if (handler.member.voice.channel !== handler.guild.members.me.voice.channel) {
            handler.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${client.i18n.get(handler.language, 'error', 'no_same_voice')}`)
                        .setColor(client.color),
                ],
            });
            return false;
        }
        return true;
    }
    getTitle(client, type, tracks, value) {
        if (client.config.player.AVOID_SUSPEND)
            return tracks[0].title;
        else {
            if (type === 'PLAYLIST') {
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
            const url = String(interaction.options.get('search').value);
            const maxLength = yield client.db.maxlength.get(interaction.user.id);
            const Random = client.config.player.AUTOCOMPLETE_SEARCH[Math.floor(Math.random() * client.config.player.AUTOCOMPLETE_SEARCH.length)];
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
                    name: `${client.i18n.get(language, 'command.music', 'no_node')}`,
                    value: `${client.i18n.get(language, 'command.music', 'no_node')}`,
                });
                return;
            }
            const searchRes = yield client.rainlink.search(url || Random);
            const tracks = searchRes.tracks.filter((e) => (maxLength ? e.duration > maxLength : e));
            if (tracks.length == 0 || !searchRes.tracks) {
                return choice.push({ name: 'Error song not matches', value: url });
            }
            for (let i = 0; i < 10; i++) {
                const x = tracks[i];
                choice.push({
                    name: x && x.title ? x.title : 'Unknown track name',
                    value: x && x.uri ? x.uri : url,
                });
            }
            yield interaction.respond(choice).catch(() => { });
        });
    }
}
