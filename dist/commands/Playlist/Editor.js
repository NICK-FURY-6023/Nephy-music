var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle, } from "discord.js";
import { Accessableby } from "../../structures/Command.js";
let count = 0;
let answer = [];
export default class {
    constructor() {
        this.name = ["pl", "editor"];
        this.description = "Edit playlist info for public";
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
            if (handler.message) {
                yield this.prefixMode(client, handler.message, handler.args, handler.language, handler.prefix);
            }
            else if (handler.interaction) {
                yield this.interactionMode(client, handler.interaction, handler.language);
            }
            else
                return;
        });
    }
    // Prefix mode
    prefixMode(client, message, args, language, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = args[0] ? args[0] : null;
            if (value == null)
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "command.playlist", "edit_arg")}`)
                            .setColor(client.color),
                    ],
                });
            const playlist = yield client.db.playlist.get(value);
            if (!playlist)
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "command.playlist", "edit_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            if (playlist.owner !== message.author.id)
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "command.playlist", "edit_playlist_owner")}`)
                            .setColor(client.color),
                    ],
                });
            const questions = this.questionString(client, language);
            for (let i = 0; i < questions.length; i++) {
                const send = yield message.reply(questions[i].question);
                const res = yield send.channel.awaitMessages({
                    filter: (m) => m.author.id === message.author.id,
                    time: 5 * 6000,
                    max: 1,
                });
                const msg = yield res.first().content;
                if (msg !== undefined || null)
                    count++;
                answer.push(msg);
                if (count == questions.length) {
                    const idCol = answer[0];
                    const nameCol = answer[1];
                    const desCol = answer[2];
                    const modeCol = answer[3];
                    const newId = idCol.length !== 0 ? idCol : null;
                    const newName = nameCol.length !== 0 ? nameCol : playlist.name;
                    const newDes = desCol.length !== 0 ? desCol : playlist.description ? playlist.description : "null";
                    const newMode = modeCol.length !== 0 ? modeCol : playlist.private;
                    if (newId) {
                        if (!this.vaildId(newId)) {
                            message.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(`${client.getString(language, "command.playlist", "edit_invalid_id")}`)
                                        .setColor(client.color),
                                ],
                            });
                            count = 0;
                            answer.length = 0;
                            return;
                        }
                        const isAlreadyId = yield client.db.playlist.get(newId);
                        if (isAlreadyId)
                            return message.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_invalid_id")}`)
                                        .setColor(client.color),
                                ],
                            });
                        if (this.validMode(String(newMode)) == null) {
                            message.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(`${client.getString(language, "command.playlist", "edit_invalid_mode")}`)
                                        .setColor(client.color),
                                ],
                            });
                            count = 0;
                            answer.length = 0;
                            return;
                        }
                        yield client.db.playlist.set(newId, {
                            id: newId,
                            name: newName,
                            description: newDes,
                            owner: playlist.owner,
                            tracks: playlist.tracks,
                            private: newMode,
                            created: playlist.created,
                        });
                        yield message.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(`${client.getString(language, "command.playlist", "edit_success", {
                                    playlistId: newId,
                                })}`)
                                    .setColor(client.color),
                            ],
                        });
                        if (playlist.id !== newId)
                            yield client.db.playlist.delete(playlist.id);
                        count = 0;
                        answer.length = 0;
                        return;
                    }
                    if (this.validMode(String(newMode)) == null) {
                        message.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(`${client.getString(language, "command.playlist", "edit_invalid_mode")}`)
                                    .setColor(client.color),
                            ],
                        });
                        count = 0;
                        answer.length = 0;
                        return;
                    }
                    yield client.db.playlist.set(`${value}.name`, newName);
                    yield client.db.playlist.set(`${value}.description`, newDes);
                    yield client.db.playlist.set(`${value}.private`, newMode);
                    const embed = new EmbedBuilder()
                        .setDescription(`${client.getString(language, "command.playlist", "edit_success", {
                        playlistId: playlist.id,
                    })}`)
                        .setColor(client.color);
                    message.reply({ embeds: [embed] });
                    count = 0;
                    answer.length = 0;
                }
            }
        });
    }
    questionString(client, language) {
        return [
            {
                question: `${client.getString(language, "command.playlist", "edit_playlist_id_label")}`,
            },
            {
                question: `${client.getString(language, "command.playlist", "edit_playlist_name_label")}`,
            },
            {
                question: `${client.getString(language, "command.playlist", "edit_playlist_des_label")}`,
            },
            {
                question: `${client.getString(language, "command.playlist", "edit_playlist_private_label")}`,
            },
        ];
    }
    vaildId(id) {
        return /^[\w&.-]+$/.test(id);
    }
    validMode(value) {
        if (typeof value === "string") {
            value = value.trim().toLowerCase();
        }
        switch (value) {
            case "public":
                return true;
            case "private":
                return false;
            case "true":
                return true;
            case "false":
                return false;
            default:
                return null;
        }
    }
    // Interaction mode
    interactionMode(client, interaction, language) {
        return __awaiter(this, void 0, void 0, function* () {
            const playlistId = new TextInputBuilder()
                .setLabel(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_id_label")}`)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_id_placeholder")}`)
                .setCustomId("pl_id")
                .setRequired(false);
            const playlistName = new TextInputBuilder()
                .setLabel(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_name_label")}`)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_name_placeholder")}`)
                .setCustomId("pl_name")
                .setRequired(false);
            const playlistDes = new TextInputBuilder()
                .setLabel(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_des_label")}`)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_des_placeholder")}`)
                .setCustomId("pl_des")
                .setRequired(false);
            const playlistPrivate = new TextInputBuilder()
                .setLabel(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_private_label")}`)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_private_placeholder")}`)
                .setCustomId("pl_mode")
                .setRequired(false);
            const modal = new ModalBuilder()
                .setCustomId("play_extra")
                .setTitle("Playlist editor")
                .setComponents(new ActionRowBuilder().addComponents(playlistId), new ActionRowBuilder().addComponents(playlistName), new ActionRowBuilder().addComponents(playlistDes), new ActionRowBuilder().addComponents(playlistPrivate));
            const value = interaction.options.getString("id");
            const playlist = yield client.db.playlist.get(value);
            if (!playlist)
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            if (playlist.owner !== interaction.user.id)
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_owner")}`)
                            .setColor(client.color),
                    ],
                });
            yield interaction.showModal(modal);
            const collector = yield interaction
                .awaitModalSubmit({
                time: 60000,
                filter: (i) => i.user.id === interaction.user.id,
            })
                .catch((error) => {
                console.error(error);
                return null;
            });
            if (!collector)
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_error")}`)
                            .setColor(client.color),
                    ],
                });
            // Send Message
            yield collector.deferReply();
            if (!playlist)
                return collector.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_notfound")}`)
                            .setColor(client.color),
                    ],
                });
            const idCol = collector.fields.getTextInputValue("pl_id");
            const nameCol = collector.fields.getTextInputValue("pl_name");
            const desCol = collector.fields.getTextInputValue("pl_des");
            const modeCol = collector.fields.getTextInputValue("pl_mode");
            const newId = idCol.length !== 0 ? idCol : null;
            const newName = nameCol.length !== 0 ? nameCol : playlist.name;
            const newDes = desCol.length !== 0 ? desCol : playlist.description ? playlist.description : "null";
            const newMode = modeCol.length !== 0 ? modeCol : playlist.private;
            if (newId) {
                if (!this.vaildId(newId))
                    return collector.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_invalid_id")}`)
                                .setColor(client.color),
                        ],
                    });
                const isAlreadyId = yield client.db.playlist.get(newId);
                if (isAlreadyId)
                    return collector.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_invalid_id")}`)
                                .setColor(client.color),
                        ],
                    });
                if (this.validMode(String(newMode)) == null)
                    return collector.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(language, "command.playlist", "edit_invalid_mode")}`)
                                .setColor(client.color),
                        ],
                    });
                yield client.db.playlist.set(newId, {
                    id: newId,
                    name: newName,
                    description: newDes,
                    owner: playlist.owner,
                    tracks: playlist.tracks,
                    private: newMode,
                    created: playlist.created,
                });
                yield collector.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_success", {
                            playlistId: newId,
                        })}`)
                            .setColor(client.color),
                    ],
                });
                if (playlist.id !== newId)
                    yield client.db.playlist.delete(playlist.id);
                return;
            }
            if (this.validMode(String(newMode)) == null)
                return collector.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "command.playlist", "edit_invalid_mode")}`)
                            .setColor(client.color),
                    ],
                });
            yield client.db.playlist.set(`${value}.name`, newName);
            yield client.db.playlist.set(`${value}.description`, newDes);
            yield client.db.playlist.set(`${value}.private`, newMode);
            yield collector.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_success", {
                        playlistId: playlist.id,
                    })}`)
                        .setColor(client.color),
                ],
            });
        });
    }
}
