var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, } from "discord.js";
export class PageQueue {
    constructor(client, pages, timeout, queueLength, language) {
        this.client = client;
        this.pages = pages;
        this.timeout = timeout;
        this.queueLength = queueLength;
        this.language = language;
    }
    slashPage(interaction, queueDuration) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction && !interaction.channel)
                throw new Error("Channel is inaccessible.");
            if (!this.pages)
                throw new Error("Pages are not given.");
            const row1 = new ButtonBuilder()
                .setCustomId("back")
                .setEmoji(this.client.icons.arrow_previous)
                .setStyle(ButtonStyle.Secondary);
            const row2 = new ButtonBuilder()
                .setCustomId("next")
                .setEmoji(this.client.icons.arrow_next)
                .setStyle(ButtonStyle.Secondary);
            const row = new ActionRowBuilder().addComponents(row1, row2);
            let page = 0;
            const curPage = yield interaction.editReply({
                embeds: [
                    this.pages[page].setFooter({
                        text: `${this.client.getString(this.language, "command.music", "queue_footer", {
                            page: String(page + 1),
                            pages: String(this.pages.length),
                            queue_lang: String(this.queueLength),
                            duration: String(queueDuration),
                        })}`,
                    }),
                ],
                components: [row],
                allowedMentions: { repliedUser: false },
            });
            if (this.pages.length == 0)
                return;
            const collector = yield curPage.createMessageComponentCollector({
                filter: (m) => m.user.id === interaction.user.id,
                time: this.timeout,
            });
            collector.on("collect", (interaction) => __awaiter(this, void 0, void 0, function* () {
                if (!interaction.deferred)
                    yield interaction.deferUpdate();
                if (interaction.customId === "back") {
                    page = page > 0 ? --page : this.pages.length - 1;
                }
                else if (interaction.customId === "next") {
                    page = page + 1 < this.pages.length ? ++page : 0;
                }
                curPage.edit({
                    embeds: [
                        this.pages[page].setFooter({
                            text: `${this.client.getString(this.language, "command.music", "queue_footer", {
                                page: String(page + 1),
                                pages: String(this.pages.length),
                                queue_lang: String(this.queueLength),
                                duration: String(queueDuration),
                            })}`,
                        }),
                    ],
                    components: [row],
                });
            }));
            collector.on("end", () => {
                const disabled = new ActionRowBuilder().addComponents(row1.setDisabled(true), row2.setDisabled(true));
                curPage.edit({
                    embeds: [
                        this.pages[page].setFooter({
                            text: `${this.client.getString(this.language, "command.music", "queue_footer", {
                                page: String(page + 1),
                                pages: String(this.pages.length),
                                queue_lang: String(this.queueLength),
                                duration: String(queueDuration),
                            })}`,
                        }),
                    ],
                    components: [disabled],
                });
                collector.removeAllListeners();
            });
            return curPage;
        });
    }
    slashPlaylistPage(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction && !interaction.channel)
                throw new Error("Channel is inaccessible.");
            if (!this.pages)
                throw new Error("Pages are not given.");
            const row1 = new ButtonBuilder()
                .setCustomId("back")
                .setEmoji(this.client.icons.arrow_previous)
                .setStyle(ButtonStyle.Secondary);
            const row2 = new ButtonBuilder()
                .setCustomId("next")
                .setEmoji(this.client.icons.arrow_next)
                .setStyle(ButtonStyle.Secondary);
            const row = new ActionRowBuilder().addComponents(row1, row2);
            let page = 0;
            const curPage = yield interaction.editReply({
                embeds: [
                    this.pages[page].setFooter({
                        text: `${this.client.getString(this.language, "command.playlist", "view_embed_footer", {
                            page: String(page + 1),
                            pages: String(this.pages.length),
                            songs: String(this.queueLength),
                        })}`,
                    }),
                ],
                components: [row],
                allowedMentions: { repliedUser: false },
            });
            if (this.pages.length == 0)
                return;
            const collector = yield curPage.createMessageComponentCollector({
                filter: (m) => m.user.id === interaction.user.id,
                time: this.timeout,
            });
            collector.on("collect", (interaction) => __awaiter(this, void 0, void 0, function* () {
                if (!interaction.deferred)
                    yield interaction.deferUpdate();
                if (interaction.customId === "back") {
                    page = page > 0 ? --page : this.pages.length - 1;
                }
                else if (interaction.customId === "next") {
                    page = page + 1 < this.pages.length ? ++page : 0;
                }
                curPage.edit({
                    embeds: [
                        this.pages[page].setFooter({
                            text: `${this.client.getString(this.language, "command.playlist", "view_embed_footer", {
                                page: String(page + 1),
                                pages: String(this.pages.length),
                                songs: String(this.queueLength),
                            })}`,
                        }),
                    ],
                    components: [row],
                });
            }));
            collector.on("end", () => {
                const disabled = new ActionRowBuilder().addComponents(row1.setDisabled(true), row2.setDisabled(true));
                curPage.edit({
                    embeds: [
                        this.pages[page].setFooter({
                            text: `${this.client.getString(this.language, "command.playlist", "view_embed_footer", {
                                page: String(page + 1),
                                pages: String(this.pages.length),
                                songs: String(this.queueLength),
                            })}`,
                        }),
                    ],
                    components: [disabled],
                });
                collector.removeAllListeners();
            });
            return curPage;
        });
    }
    prefixPage(message, queueDuration) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!message && !message.channel)
                throw new Error("Channel is inaccessible.");
            if (!this.pages)
                throw new Error("Pages are not given.");
            const row1 = new ButtonBuilder()
                .setCustomId("back")
                .setEmoji(this.client.icons.arrow_previous)
                .setStyle(ButtonStyle.Secondary);
            const row2 = new ButtonBuilder()
                .setCustomId("next")
                .setEmoji(this.client.icons.arrow_next)
                .setStyle(ButtonStyle.Secondary);
            const row = new ActionRowBuilder().addComponents(row1, row2);
            let page = 0;
            const curPage = yield message.reply({
                embeds: [
                    this.pages[page].setFooter({
                        text: `${this.client.getString(this.language, "command.music", "queue_footer", {
                            page: String(page + 1),
                            pages: String(this.pages.length),
                            queue_lang: String(this.queueLength),
                            duration: String(queueDuration),
                        })}`,
                    }),
                ],
                components: [row],
                allowedMentions: { repliedUser: false },
            });
            if (this.pages.length == 0)
                return;
            const collector = yield curPage.createMessageComponentCollector({
                filter: (interaction) => (interaction.user.id === message.author.id ? true : false && interaction.deferUpdate()),
                time: this.timeout,
            });
            collector.on("collect", (interaction) => __awaiter(this, void 0, void 0, function* () {
                if (!interaction.deferred)
                    yield interaction.deferUpdate();
                if (interaction.customId === "back") {
                    page = page > 0 ? --page : this.pages.length - 1;
                }
                else if (interaction.customId === "next") {
                    page = page + 1 < this.pages.length ? ++page : 0;
                }
                curPage.edit({
                    embeds: [
                        this.pages[page].setFooter({
                            text: `${this.client.getString(this.language, "command.music", "queue_footer", {
                                page: String(page + 1),
                                pages: String(this.pages.length),
                                queue_lang: String(this.queueLength),
                                duration: String(queueDuration),
                            })}`,
                        }),
                    ],
                    components: [row],
                });
            }));
            collector.on("end", () => {
                const disabled = new ActionRowBuilder().addComponents(row1.setDisabled(true), row2.setDisabled(true));
                curPage.edit({
                    embeds: [
                        this.pages[page].setFooter({
                            text: `${this.client.getString(this.language, "command.music", "queue_footer", {
                                page: String(page + 1),
                                pages: String(this.pages.length),
                                queue_lang: String(this.queueLength),
                                duration: String(queueDuration),
                            })}`,
                        }),
                    ],
                    components: [disabled],
                });
                collector.removeAllListeners();
            });
            return curPage;
        });
    }
    prefixPlaylistPage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!message && !message.channel)
                throw new Error("Channel is inaccessible.");
            if (!this.pages)
                throw new Error("Pages are not given.");
            const row1 = new ButtonBuilder()
                .setCustomId("back")
                .setEmoji(this.client.icons.arrow_previous)
                .setStyle(ButtonStyle.Secondary);
            const row2 = new ButtonBuilder()
                .setCustomId("next")
                .setEmoji(this.client.icons.arrow_next)
                .setStyle(ButtonStyle.Secondary);
            const row = new ActionRowBuilder().addComponents(row1, row2);
            let page = 0;
            const curPage = yield message.reply({
                embeds: [
                    this.pages[page].setFooter({
                        text: `${this.client.getString(this.language, "command.playlist", "view_embed_footer", {
                            page: String(page + 1),
                            pages: String(this.pages.length),
                            songs: String(this.queueLength),
                        })}`,
                    }),
                ],
                components: [row],
                allowedMentions: { repliedUser: false },
            });
            if (this.pages.length == 0)
                return;
            const collector = yield curPage.createMessageComponentCollector({
                filter: (interaction) => (interaction.user.id === message.author.id ? true : false && interaction.deferUpdate()),
                time: this.timeout,
            });
            collector.on("collect", (interaction) => __awaiter(this, void 0, void 0, function* () {
                if (!interaction.deferred)
                    yield interaction.deferUpdate();
                if (interaction.customId === "back") {
                    page = page > 0 ? --page : this.pages.length - 1;
                }
                else if (interaction.customId === "next") {
                    page = page + 1 < this.pages.length ? ++page : 0;
                }
                curPage.edit({
                    embeds: [
                        this.pages[page].setFooter({
                            text: `${this.client.getString(this.language, "command.playlist", "view_embed_footer", {
                                page: String(page + 1),
                                pages: String(this.pages.length),
                                songs: String(this.queueLength),
                            })}`,
                        }),
                    ],
                    components: [row],
                });
            }));
            collector.on("end", () => {
                const disabled = new ActionRowBuilder().addComponents(row1.setDisabled(true), row2.setDisabled(true));
                curPage.edit({
                    embeds: [
                        this.pages[page].setFooter({
                            text: `${this.client.getString(this.language, "command.playlist", "view_embed_footer", {
                                page: String(page + 1),
                                pages: String(this.pages.length),
                                songs: String(this.queueLength),
                            })}`,
                        }),
                    ],
                    components: [disabled],
                });
                collector.removeAllListeners();
            });
            return curPage;
        });
    }
    buttonPage(interaction, queueDuration) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction && !interaction.channel)
                throw new Error("Channel is inaccessible.");
            if (!this.pages)
                throw new Error("Pages are not given.");
            const row1 = new ButtonBuilder()
                .setCustomId("back")
                .setEmoji(this.client.icons.arrow_previous)
                .setStyle(ButtonStyle.Secondary);
            const row2 = new ButtonBuilder()
                .setCustomId("next")
                .setEmoji(this.client.icons.arrow_next)
                .setStyle(ButtonStyle.Secondary);
            const row = new ActionRowBuilder().addComponents(row1, row2);
            let page = 0;
            const curPage = yield interaction.reply({
                embeds: [
                    this.pages[page].setFooter({
                        text: `${this.client.getString(this.language, "command.music", "queue_footer", {
                            page: String(page + 1),
                            pages: String(this.pages.length),
                            queue_lang: String(this.queueLength),
                            duration: String(queueDuration),
                        })}`,
                    }),
                ],
                components: [row],
                allowedMentions: { repliedUser: false },
                ephemeral: true,
            });
            if (this.pages.length == 0)
                return;
            const collector = yield curPage.createMessageComponentCollector({
                filter: (m) => m.user.id === interaction.user.id,
                time: this.timeout,
            });
            collector.on("collect", (interaction) => __awaiter(this, void 0, void 0, function* () {
                if (!interaction.deferred)
                    yield interaction.deferUpdate();
                if (interaction.customId === "back") {
                    page = page > 0 ? --page : this.pages.length - 1;
                }
                else if (interaction.customId === "next") {
                    page = page + 1 < this.pages.length ? ++page : 0;
                }
                interaction.editReply({
                    embeds: [
                        this.pages[page].setFooter({
                            text: `${this.client.getString(this.language, "command.music", "queue_footer", {
                                page: String(page + 1),
                                pages: String(this.pages.length),
                                queue_lang: String(this.queueLength),
                                duration: String(queueDuration),
                            })}`,
                        }),
                    ],
                    components: [row],
                });
            }));
            collector.on("end", () => {
                const disabled = new ActionRowBuilder().addComponents(row1.setDisabled(true), row2.setDisabled(true));
                interaction.editReply({
                    embeds: [
                        this.pages[page].setFooter({
                            text: `${this.client.getString(this.language, "command.music", "queue_footer", {
                                page: String(page + 1),
                                pages: String(this.pages.length),
                                queue_lang: String(this.queueLength),
                                duration: String(queueDuration),
                            })}`,
                        }),
                    ],
                    components: [disabled],
                });
                collector.removeAllListeners();
            });
            return curPage;
        });
    }
}
