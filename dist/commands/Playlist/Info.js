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
import humanizeDuration from "humanize-duration";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["pl", "info"];
        this.description = "Check the playlist infomation";
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
            const info = yield client.db.playlist.get(value);
            if (!info)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "invalid")}`)
                            .setColor(client.color),
                    ],
                });
            const created = humanizeDuration(Date.now() - Number(info.created), {
                largest: 1,
            });
            const name = yield client.users.fetch(info.owner);
            const embed = new EmbedBuilder()
                .setTitle(info.name)
                .addFields([
                {
                    name: `${client.getString(handler.language, "command.playlist", "info_owner")}`,
                    value: `${name.username}`,
                },
                {
                    name: `${client.getString(handler.language, "command.playlist", "info_id")}`,
                    value: `${info.id}`,
                },
                {
                    name: `${client.getString(handler.language, "command.playlist", "info_des")}`,
                    value: `${info.description === null || info.description === "null"
                        ? client.getString(handler.language, "command.playlist", "no_des")
                        : info.description}`,
                },
                {
                    name: `${client.getString(handler.language, "command.playlist", "info_private")}`,
                    value: `${info.private
                        ? client.getString(handler.language, "command.playlist", "public")
                        : client.getString(handler.language, "command.playlist", "private")}`,
                },
                {
                    name: `${client.getString(handler.language, "command.playlist", "info_created")}`,
                    value: `${created}`,
                },
                {
                    name: `${client.getString(handler.language, "command.playlist", "info_total")}`,
                    value: `${info.tracks.length}`,
                },
            ])
                .setColor(client.color);
            handler.editReply({ embeds: [embed] });
        });
    }
}
