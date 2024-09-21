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
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["pl", "remove"];
        this.description = "Remove a song from a playlist";
        this.category = "Playlist";
        this.accessableby = Accessableby.Member;
        this.usage = "<playlist_id> <song_postion>";
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
                name: "postion",
                description: "The position of the song",
                required: true,
                type: ApplicationCommandOptionType.Integer,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield handler.deferReply();
            const value = handler.args[0] ? handler.args[0] : null;
            const pos = handler.args[1];
            if (value == null)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "invalid")}`)
                            .setColor(client.color),
                    ],
                });
            if (pos && isNaN(+pos))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
                            .setColor(client.color),
                    ],
                });
            const playlist = yield client.db.playlist.get(`${value}`);
            if (!playlist)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "remove_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            if (playlist.owner !== ((_a = handler.user) === null || _a === void 0 ? void 0 : _a.id))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "remove_owner")}`)
                            .setColor(client.color),
                    ],
                });
            const position = pos;
            const song = playlist.tracks[Number(position) - 1];
            if (!song)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "remove_song_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            yield client.db.playlist.pull(`${value}.tracks`, playlist.tracks[Number(position) - 1]);
            const embed = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.playlist", "remove_removed", {
                name: value,
                position: pos,
            })}`)
                .setColor(client.color);
            handler.editReply({ embeds: [embed] });
        });
    }
}
