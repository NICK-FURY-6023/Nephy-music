var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder, ApplicationCommandOptionType, ChannelType } from "discord.js";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["setup"];
        this.description = "Setup channel song request";
        this.category = "Utils";
        this.accessableby = Accessableby.Manager;
        this.usage = "<create> or <delete>";
        this.aliases = ["setup"];
        this.lavalink = false;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: "type",
                description: "Type of channel",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: "Create",
                        value: "create",
                    },
                    {
                        name: "Delete",
                        value: "delete",
                    },
                ],
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            let option = ["create", "delete"];
            if (!handler.args[0] || !option.includes(handler.args[0]))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "arg_error", {
                            text: "**create** or **delete**!",
                        })}`)
                            .setColor(client.color),
                    ],
                });
            const value = handler.args[0];
            if (value === "create") {
                const SetupChannel = yield client.db.setup.get(`${handler.guild.id}`);
                if (SetupChannel && SetupChannel.enable == true)
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(handler.language, "command.utils", "setup_enable")}`)
                                .setColor(client.color),
                        ],
                    });
                const parent = yield handler.guild.channels.create({
                    name: `${client.user.username}'s Music`,
                    type: ChannelType.GuildCategory,
                });
                const textChannel = yield handler.guild.channels.create({
                    name: "song-request",
                    type: ChannelType.GuildText,
                    topic: `${client.getString(handler.language, "command.utils", "setup_topic")}`,
                    parent: parent.id,
                });
                const queueMsg = `${client.getString(handler.language, "event.setup", "setup_queuemsg")}`;
                const playEmbed = new EmbedBuilder()
                    .setColor(client.color)
                    .setAuthor({
                    name: `${client.getString(handler.language, "event.setup", "setup_playembed_author")}`,
                })
                    .setImage(`https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.jpeg?size=300`);
                const channel_msg = yield textChannel.send({
                    content: `${queueMsg}`,
                    embeds: [playEmbed],
                    components: [client.diSwitch],
                });
                const voiceChannel = yield handler.guild.channels.create({
                    name: `${client.user.username}`,
                    type: ChannelType.GuildVoice,
                    parent: parent.id,
                    userLimit: 99,
                });
                const new_data = {
                    guild: handler.guild.id,
                    enable: true,
                    channel: textChannel.id,
                    playmsg: channel_msg.id,
                    voice: voiceChannel.id,
                    category: parent.id,
                };
                yield client.db.setup.set(`${handler.guild.id}`, new_data);
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.utils", "setup_msg", {
                    channel: String(textChannel),
                })}`)
                    .setColor(client.color);
                return handler.editReply({ embeds: [embed] });
            }
            else if (value === "delete") {
                const SetupChannel = yield client.db.setup.get(`${handler.guild.id}`);
                const embed_none = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.utils", "setup_null")}`)
                    .setColor(client.color);
                if (SetupChannel == null)
                    return handler.editReply({ embeds: [embed_none] });
                if (SetupChannel.enable == false)
                    return handler.editReply({ embeds: [embed_none] });
                const fetchedTextChannel = SetupChannel.channel
                    ? yield handler.guild.channels.fetch(SetupChannel.channel).catch(() => { })
                    : undefined;
                const fetchedVoiceChannel = SetupChannel.voice
                    ? yield handler.guild.channels.fetch(SetupChannel.voice).catch(() => { })
                    : undefined;
                const fetchedCategory = SetupChannel.category
                    ? yield handler.guild.channels.fetch(SetupChannel.category).catch(() => { })
                    : undefined;
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.utils", "setup_deleted", {
                    channel: String(fetchedTextChannel),
                })}`)
                    .setColor(client.color);
                if (fetchedCategory)
                    yield fetchedCategory.delete().catch(() => null);
                if (fetchedVoiceChannel)
                    yield fetchedVoiceChannel.delete().catch(() => null);
                if (fetchedTextChannel)
                    yield fetchedTextChannel.delete().catch(() => null);
                yield client.db.setup.delete(`${handler.guild.id}`);
                if (!fetchedCategory || !fetchedTextChannel || !fetchedVoiceChannel) {
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(handler.language, "command.utils", "setup_null")}`)
                                .setColor(client.color),
                        ],
                    });
                }
                return handler.editReply({ embeds: [embed] });
            }
        });
    }
}
