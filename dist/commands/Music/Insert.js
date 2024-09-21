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
import { ConvertTime } from "../../utilities/ConvertTime.js";
// Main code
export default class {
    constructor() {
        this.name = ["insert"];
        this.description = "Insert a song into a specific position in queue.";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = [];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
        this.options = [
            {
                name: "position",
                description: "The position in queue want to remove.",
                type: ApplicationCommandOptionType.Integer,
                required: true,
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
            const player = client.rainlink.players.get(handler.guild.id);
            const position = Number(handler.args[0]);
            handler.args.splice(0, 1);
            const song = handler.args.join(" ");
            if (position && isNaN(+position))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
                            .setColor(client.color),
                    ],
                });
            if (Number(position) == 0)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "insert_already")}`)
                            .setColor(client.color),
                    ],
                });
            if (Number(position) > player.queue.length)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "insert_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            const result = yield player.search(song, { requester: handler.user });
            const track = result.tracks[0];
            if (!result.tracks.length)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "insert_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            player.queue.splice(position - 1, 0, track);
            const embed = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.music", "insert_desc", {
                name: this.getTitle(client, track),
                duration: new ConvertTime().parse(player.position),
                request: String(track.requester),
            })}`)
                .setColor(client.color);
            (_a = client.wsl.get(handler.guild.id)) === null || _a === void 0 ? void 0 : _a.send({
                op: "playerQueueInsert",
                guild: handler.guild.id,
                track: {
                    title: track.title,
                    uri: track.uri,
                    length: track.duration,
                    thumbnail: track.artworkUrl,
                    author: track.author,
                    requester: track.requester
                        ? {
                            id: track.requester.id,
                            username: track.requester.username,
                            globalName: track.requester.globalName,
                            defaultAvatarURL: (_b = track.requester.defaultAvatarURL) !== null && _b !== void 0 ? _b : null,
                        }
                        : null,
                },
                index: position - 1,
            });
            return handler.editReply({ embeds: [embed] });
        });
    }
    getTitle(client, tracks) {
        if (client.config.lavalink.AVOID_SUSPEND)
            return tracks.title;
        else {
            return `[${tracks.title}](${tracks.uri})`;
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
                    name: `${client.getString(language, "command.music", "no_node")}`,
                    value: `${client.getString(language, "command.music", "no_node")}`,
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
