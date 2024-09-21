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
import id from "voucher-code-generator";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["pl", "create"];
        this.description = "Create a new playlist";
        this.category = "Playlist";
        this.accessableby = Accessableby.Member;
        this.usage = "<playlist_name> <playlist_description>";
        this.aliases = [];
        this.lavalink = true;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: "name",
                description: "The name of the playlist",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
            {
                name: "description",
                description: "The description of the playlist",
                type: ApplicationCommandOptionType.String,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield handler.deferReply();
            const value = handler.args[0];
            const des = handler.args[1];
            if (value == null || !value)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "invalid")}`)
                            .setColor(client.color),
                    ],
                });
            if (value.length > 16)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "create_toolong")}`)
                            .setColor(client.color),
                    ],
                });
            if (des && des.length > 1000)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "des_toolong")}`)
                            .setColor(client.color),
                    ],
                });
            const fullList = yield client.db.playlist.all();
            const Limit = fullList.filter((data) => {
                var _a;
                return data.value.owner == ((_a = handler.user) === null || _a === void 0 ? void 0 : _a.id);
            });
            if (Limit.length >= client.config.bot.LIMIT_PLAYLIST) {
                handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "create_limit_playlist", {
                            limit: String(client.config.bot.LIMIT_PLAYLIST),
                        })}`)
                            .setColor(client.color),
                    ],
                });
                return;
            }
            const idgen = id.generate({ length: 8, prefix: "playlist-" });
            yield client.db.playlist.set(`${idgen}`, {
                id: idgen[0],
                name: value,
                owner: (_a = handler.user) === null || _a === void 0 ? void 0 : _a.id,
                tracks: [],
                private: true,
                created: Date.now(),
                description: des ? des : null,
            });
            const embed = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.playlist", "create_created", {
                playlist: String(value),
                id: idgen[0],
            })}`)
                .setColor(client.color);
            handler.editReply({ content: " ", embeds: [embed] });
        });
    }
}
