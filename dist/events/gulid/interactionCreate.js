var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PermissionsBitField, EmbedBuilder, PermissionFlagsBits, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, } from "discord.js";
import { CheckPermissionServices } from "../../services/CheckPermissionService.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Accessableby } from "../../structures/Command.js";
import { ConvertToMention } from "../../utilities/ConvertToMention.js";
import { RatelimitReplyService } from "../../services/RatelimitReplyService.js";
import { RateLimitManager } from "@sapphire/ratelimits";
import { AutoCompleteService } from "../../services/AutoCompleteService.js";
import { TopggServiceEnum } from "../../services/TopggService.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
const commandRateLimitManager = new RateLimitManager(1000);
/**
 * @param {GlobalInteraction} interaction
 */
export default class {
    execute(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (interaction.isAutocomplete())
                return new AutoCompleteService(client, interaction);
            if (!interaction.isChatInputCommand())
                return;
            if (!interaction.guild || interaction.user.bot)
                return;
            if (!client.isDatabaseConnected)
                return client.logger.warn(import.meta.url, "The database is not yet connected so this event will temporarily not execute. Please try again later!");
            let guildModel = yield client.db.language.get(`${interaction.guild.id}`);
            if (!guildModel) {
                guildModel = yield client.db.language.set(`${interaction.guild.id}`, client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            let subCommandName = "";
            try {
                subCommandName = interaction.options.getSubcommand();
            }
            catch (_b) { }
            let subCommandGroupName;
            try {
                subCommandGroupName = interaction.options.getSubcommandGroup();
            }
            catch (_c) { }
            const commandNameArray = [];
            if (interaction.commandName)
                commandNameArray.push(interaction.commandName);
            if (subCommandName.length !== 0 && !subCommandGroupName)
                commandNameArray.push(subCommandName);
            if (subCommandGroupName) {
                commandNameArray.push(subCommandGroupName);
                commandNameArray.push(subCommandName);
            }
            const command = client.commands.get(commandNameArray.join("-"));
            if (!command)
                return commandNameArray.length == 0;
            //////////////////////////////// Ratelimit check start ////////////////////////////////
            const ratelimit = commandRateLimitManager.acquire(`${interaction.user.id}@${command.name.join("-")}`);
            if (ratelimit.limited) {
                new RatelimitReplyService({
                    client: client,
                    language: language,
                    interaction: interaction,
                    time: Number(((ratelimit.expires - Date.now()) / 1000).toFixed(1)),
                }).reply();
                return;
            }
            else if (ratelimit.limited)
                return;
            ratelimit.consume();
            //////////////////////////////// Ratelimit check end ////////////////////////////////
            //////////////////////////////// Permission check start ////////////////////////////////
            const permissionChecker = new CheckPermissionServices();
            // Default permission
            const defaultPermissions = [
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.ReadMessageHistory,
            ];
            const musicPermissions = [PermissionFlagsBits.Speak, PermissionFlagsBits.Connect];
            const managePermissions = [PermissionFlagsBits.ManageChannels];
            function respondError(interaction, permissionResult) {
                return __awaiter(this, void 0, void 0, function* () {
                    const selfErrorString = `${client.getString(language, "error", "no_perms", {
                        perm: permissionResult.result,
                    })}`;
                    const embed = new EmbedBuilder()
                        .setDescription(permissionResult.channel == "Self"
                        ? selfErrorString
                        : `${client.getString(language, "error", "no_perms_channel", {
                            perm: permissionResult.result,
                            channel: permissionResult.channel,
                        })}`)
                        .setColor(client.color);
                    yield interaction.reply({
                        embeds: [embed],
                    });
                });
            }
            if (command.name[0] !== "help") {
                const returnData = yield permissionChecker.interaction(interaction, defaultPermissions);
                if (returnData.result !== "PermissionPass")
                    return respondError(interaction, returnData);
            }
            if (command.category.toLocaleLowerCase() == "music") {
                const returnData = yield permissionChecker.interaction(interaction, musicPermissions);
                if (returnData.result !== "PermissionPass")
                    return respondError(interaction, returnData);
            }
            if (command.accessableby == Accessableby.Manager) {
                const returnData = yield permissionChecker.interaction(interaction, managePermissions);
                if (returnData.result !== "PermissionPass")
                    return respondError(interaction, returnData);
            }
            else if (command.permissions.length !== 0) {
                const returnData = yield permissionChecker.interaction(interaction, command.permissions);
                if (returnData.result !== "PermissionPass")
                    return respondError(interaction, returnData);
            }
            //////////////////////////////// Permission check end ////////////////////////////////
            const premiumUser = yield client.db.premium.get(interaction.user.id);
            const isHavePremium = !premiumUser || !premiumUser.isPremium;
            if (command.accessableby == Accessableby.Manager &&
                !interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild))
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "error", "no_perms", { perm: "ManageGuild" })}`)
                            .setColor(client.color),
                    ],
                });
            if (command.lavalink && client.lavalinkUsing.length == 0) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder().setDescription(`${client.getString(language, "error", "no_node")}`).setColor(client.color),
                    ],
                });
            }
            if (command.accessableby == Accessableby.Owner && interaction.user.id != client.owner)
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "error", "owner_only")}`)
                            .setColor(client.color),
                    ],
                });
            if (command.accessableby == Accessableby.Admin &&
                interaction.user.id != client.owner &&
                !client.config.bot.ADMIN.includes(interaction.user.id))
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(language, "error", "no_perms", { perm: "dreamvast@admin" })}`)
                            .setColor(client.color),
                    ],
                });
            if (command.accessableby == Accessableby.Voter &&
                isHavePremium &&
                client.topgg &&
                interaction.user.id != client.owner &&
                !client.config.bot.ADMIN.includes(interaction.user.id)) {
                const voteChecker = yield client.topgg.checkVote(interaction.user.id);
                if (voteChecker == TopggServiceEnum.ERROR) {
                    const embed = new EmbedBuilder()
                        .setAuthor({
                        name: client.getString(language, "error", "topgg_error_author"),
                    })
                        .setDescription(client.getString(language, "error", "topgg_error_desc"))
                        .setColor(client.color)
                        .setTimestamp();
                    return interaction.reply({ content: " ", embeds: [embed] });
                }
                if (voteChecker == TopggServiceEnum.UNVOTED) {
                    const embed = new EmbedBuilder()
                        .setAuthor({
                        name: client.getString(language, "error", "topgg_vote_author"),
                    })
                        .setDescription(client.getString(language, "error", "topgg_vote_desc"))
                        .setColor(client.color)
                        .setTimestamp();
                    const row = new ActionRowBuilder().addComponents(new ButtonBuilder()
                        .setLabel(client.getString(language, "error", "topgg_vote_button"))
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://top.gg/bot/${(_a = client.user) === null || _a === void 0 ? void 0 : _a.id}/vote`));
                    return interaction.reply({ content: " ", embeds: [embed], components: [row] });
                }
            }
            if (command.accessableby == Accessableby.Premium &&
                isHavePremium &&
                interaction.user.id != client.owner &&
                !client.config.bot.ADMIN.includes(interaction.user.id)) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.getString(language, "error", "no_premium_author")}`,
                    iconURL: client.user.displayAvatarURL(),
                })
                    .setDescription(`${client.getString(language, "error", "no_premium_desc")}`)
                    .setColor(client.color)
                    .setTimestamp();
                return interaction.reply({
                    content: " ",
                    embeds: [embed],
                });
            }
            if (command.playerCheck) {
                const player = client.rainlink.players.get(interaction.guild.id);
                const twentyFourBuilder = new AutoReconnectBuilderService(client);
                const is247 = yield twentyFourBuilder.get(interaction.guild.id);
                if (!player || (is247 && is247.twentyfourseven && player.queue.length == 0 && !player.queue.current))
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(language, "error", "no_player")}`)
                                .setColor(client.color),
                        ],
                    });
            }
            if (command.sameVoiceCheck) {
                const { channel } = interaction.member.voice;
                if (!channel ||
                    interaction.member.voice.channel !== interaction.guild.members.me.voice.channel)
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(language, "error", "no_voice")}`)
                                .setColor(client.color),
                        ],
                    });
            }
            try {
                const args = [];
                let attachments;
                for (const data of interaction.options.data) {
                    const check = new ConvertToMention().execute({
                        type: data.type,
                        value: String(data.value),
                    });
                    if (check !== "error") {
                        args.push(check);
                    }
                    else if (data.type == ApplicationCommandOptionType.Attachment) {
                        attachments = data.attachment;
                    }
                    else {
                        if (data.value)
                            args.push(String(data.value));
                        if (data.options) {
                            for (const optionData of data.options) {
                                if (optionData.value)
                                    args.push(String(optionData.value));
                            }
                        }
                    }
                }
                const handler = new CommandHandler({
                    interaction: interaction,
                    language: language,
                    client: client,
                    args: args,
                    prefix: "/",
                });
                if (attachments)
                    handler.attactments.push(attachments);
                client.logger.info(import.meta.url, `[COMMAND] ${commandNameArray.join("-")} used by ${interaction.user.username} from ${interaction.guild.name} (${interaction.guild.id})`);
                command.execute(client, handler);
            }
            catch (error) {
                client.logger.error(import.meta.url, error);
                interaction.reply({
                    content: `${client.getString(language, "error", "unexpected_error")}\n ${error}`,
                });
            }
        });
    }
}
