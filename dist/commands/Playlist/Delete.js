var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["pl", "delete"];
        this.description = "Delete a playlist";
        this.category = "Playlist";
        this.accessableby = Accessableby.Member;
        this.usage = "<playlist_id>";
        this.aliases = [];
        this.lavalink = false;
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
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
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
            const playlist = yield client.db.playlist.get(value);
            if (!playlist)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "delete_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            if (playlist.owner !== ((_a = handler.user) === null || _a === void 0 ? void 0 : _a.id))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.playlist", "delete_owner")}`)
                            .setColor(client.color),
                    ],
                });
            const action = new ActionRowBuilder().addComponents([
                new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId("yes").setLabel("Yes"),
                new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId("no").setLabel("No"),
            ]);
            const msg = yield handler.editReply({
                embeds: [
                    new EmbedBuilder().setDescription(`${client.getString(handler.language, "command.playlist", "delete_confirm", {
                        playlist_id: value,
                    })}`),
                ],
                components: [action],
            });
            const collector = msg === null || msg === void 0 ? void 0 : msg.createMessageComponentCollector({
                filter: (m) => { var _a; return m.user.id == ((_a = handler.user) === null || _a === void 0 ? void 0 : _a.id); },
                time: 20000,
            });
            collector === null || collector === void 0 ? void 0 : collector.on("collect", (interaction) => __awaiter(this, void 0, void 0, function* () {
                const id = interaction.customId;
                if (id == "yes") {
                    yield client.db.playlist.delete(value);
                    const embed = new EmbedBuilder()
                        .setDescription(`${client.getString(handler.language, "command.playlist", "delete_deleted", {
                        name: value,
                    })}`)
                        .setColor(client.color);
                    interaction.reply({ embeds: [embed] });
                    collector.stop();
                    msg === null || msg === void 0 ? void 0 : msg.delete().catch(() => null);
                }
                else if (id == "no") {
                    const embed = new EmbedBuilder()
                        .setDescription(`${client.getString(handler.language, "command.playlist", "delete_no")}`)
                        .setColor(client.color);
                    interaction.reply({ embeds: [embed] });
                    collector.stop();
                    msg === null || msg === void 0 ? void 0 : msg.delete().catch(() => null);
                }
            }));
            collector === null || collector === void 0 ? void 0 : collector.on("end", () => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const checkMsg = yield ((_a = handler.channel) === null || _a === void 0 ? void 0 : _a.messages.fetch(String(msg === null || msg === void 0 ? void 0 : msg.id)).catch(() => undefined));
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.playlist", "delete_no")}`)
                    .setColor(client.color);
                checkMsg ? checkMsg.edit({ embeds: [embed], components: [] }) : true;
                collector === null || collector === void 0 ? void 0 : collector.removeAllListeners();
            }));
        });
    }
}
