var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { stripIndents } from "common-tags";
import fs from "fs";
import { CheckPermissionServices, } from "../../services/CheckPermissionService.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Accessableby } from "../../structures/Command.js";
import { RatelimitReplyService } from "../../services/RatelimitReplyService.js";
import { RateLimitManager } from "@sapphire/ratelimits";
import { TopggServiceEnum } from "../../services/TopggService.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
const commandRateLimitManager = new RateLimitManager(1000);
export default class {
    execute(client, message) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            if (message.author.bot || message.channel.type == ChannelType.DM)
                return;
            if (!client.isDatabaseConnected)
                return client.logger.warn("DatabaseService", "The database is not yet connected so this event will temporarily not execute. Please try again later!");
            let guildModel = yield client.db.language.get(`${message.guild.id}`);
            if (!guildModel) {
                guildModel = yield client.db.language.set(`${message.guild.id}`, client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            let PREFIX = client.prefix;
            const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
            const GuildPrefix = yield client.db.prefix.get(`${message.guild.id}`);
            if (GuildPrefix)
                PREFIX = GuildPrefix;
            else if (!GuildPrefix)
                PREFIX = String(yield client.db.prefix.set(`${message.guild.id}`, client.prefix));
            if (message.content.match(mention)) {
                const mention_embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.i18n.get(language, "event.message", "wel", {
                        bot: message.guild.members.me.displayName,
                    })}`,
                })
                    .setColor(client.color).setDescription(stripIndents `
          ${client.i18n.get(language, "event.message", "intro1", {
                    bot: message.guild.members.me.displayName,
                })}
          ${client.i18n.get(language, "event.message", "intro2")}
          ${client.i18n.get(language, "event.message", "intro3")}
          ${client.i18n.get(language, "event.message", "prefix", {
                    prefix: `\`${PREFIX}\` or \`/\``,
                })}
          ${client.i18n.get(language, "event.message", "help1", {
                    help: `\`${PREFIX}help\` or \`/help\``,
                })}
          ${client.i18n.get(language, "event.message", "help2", {
                    botinfo: `\`${PREFIX}status\` or \`/status\``,
                })}
          ${client.i18n.get(language, "event.message", "ver", {
                    botver: client.metadata.version,
                })}
          ${client.i18n.get(language, "event.message", "djs", {
                    djsver: JSON.parse(yield fs.readFileSync("package.json", "utf-8")).dependencies["discord.js"],
                })}
          ${client.i18n.get(language, "event.message", "lavalink", {
                    aver: client.metadata.autofix,
                })}
          ${client.i18n.get(language, "event.message", "codename", {
                    codename: client.metadata.codename,
                })}
          `);
                yield message.reply({ embeds: [mention_embed] });
                return;
            }
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
            if (!prefixRegex.test(message.content))
                return;
            const [matchedPrefix] = message.content.match(prefixRegex);
            const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();
            const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
            if (!command)
                return;
            const setup = yield client.db.setup.get(String(message.guildId));
            if (setup && setup.channel == message.channelId)
                return;
            //////////////////////////////// Ratelimit check start ////////////////////////////////
            const ratelimit = commandRateLimitManager.acquire(`${message.author.id}@${command.name.join("-")}`);
            if (ratelimit.limited) {
                new RatelimitReplyService({
                    client: client,
                    language: language,
                    message: message,
                    time: Number(((ratelimit.expires - Date.now()) / 1000).toFixed(1)),
                }).reply();
                return;
            }
            ratelimit.consume();
            //////////////////////////////// Ratelimit check end ////////////////////////////////
            //////////////////////////////// Permission check start ////////////////////////////////
            const permissionChecker = new CheckPermissionServices();
            //Default permission
            const defaultPermissions = [
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.ReadMessageHistory,
            ];
            const allCommandPermissions = [PermissionFlagsBits.ManageMessages];
            const musicPermissions = [PermissionFlagsBits.Speak, PermissionFlagsBits.Connect];
            const managePermissions = [PermissionFlagsBits.ManageChannels];
            function respondError(permissionResult) {
                return __awaiter(this, void 0, void 0, function* () {
                    const selfErrorString = `${client.i18n.get(language, "error", "no_perms", {
                        perm: permissionResult.result,
                    })}`;
                    const embed = new EmbedBuilder()
                        .setDescription(permissionResult.channel == "Self"
                        ? selfErrorString
                        : `${client.i18n.get(language, "error", "no_perms_channel", {
                            perm: permissionResult.result,
                            channel: permissionResult.channel,
                        })}`)
                        .setColor(client.color);
                    const dmChannel = message.author.dmChannel == null
                        ? yield message.author.createDM()
                        : message.author.dmChannel;
                    dmChannel
                        .send({
                        embeds: [embed],
                    })
                        .catch(() => __awaiter(this, void 0, void 0, function* () {
                        yield message.reply({ embeds: [embed] }).catch(() => null);
                    }));
                });
            }
            const returnData = yield permissionChecker.message(message, defaultPermissions);
            if (returnData.result !== "PermissionPass")
                return respondError(returnData);
            if (command.accessableby.includes(Accessableby.Manager)) {
                const returnData = yield permissionChecker.message(message, managePermissions);
                if (returnData.result !== "PermissionPass")
                    return respondError(returnData);
            }
            else if (command.category == "Music") {
                const returnData = yield permissionChecker.message(message, musicPermissions);
                if (returnData.result !== "PermissionPass")
                    return respondError(returnData);
            }
            else if (command.name.join("-") !== "help") {
                const returnData = yield permissionChecker.message(message, allCommandPermissions);
                if (returnData.result !== "PermissionPass")
                    return respondError(returnData);
            }
            else if (command.permissions.length !== 0) {
                const returnData = yield permissionChecker.message(message, command.permissions);
                if (returnData.result !== "PermissionPass")
                    return respondError(returnData);
            }
            //////////////////////////////// Permission check end ////////////////////////////////
            //////////////////////////////// Check avalibility start ////////////////////////////////
            if (command.lavalink && client.lavalinkUsing.length == 0) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "error", "no_node")}`)
                            .setColor(client.color),
                    ],
                });
            }
            if (command.playerCheck) {
                const player = client.rainlink.players.get(message.guild.id);
                const twentyFourBuilder = new AutoReconnectBuilderService(client);
                const is247 = yield twentyFourBuilder.get(message.guild.id);
                if (!player ||
                    (is247 && is247.twentyfourseven && player.queue.length == 0 && !player.queue.current))
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.i18n.get(language, "error", "no_player")}`)
                                .setColor(client.color),
                        ],
                    });
            }
            if (command.sameVoiceCheck) {
                const { channel } = message.member.voice;
                if (!channel || message.member.voice.channel !== message.guild.members.me.voice.channel)
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.i18n.get(language, "error", "no_voice")}`)
                                .setColor(client.color),
                        ],
                    });
            }
            if (command.accessableby.includes(Accessableby.Manager) &&
                !message.member.permissions.has(PermissionFlagsBits.ManageGuild))
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "error", "user_no_perms", { perm: "ManageGuild" })}`)
                            .setColor(client.color),
                    ],
                });
            //////////////////////////////// Check avalibility end ////////////////////////////////
            //////////////////////////////// Check accessibility start ////////////////////////////////
            const premiumUser = yield client.db.premium.get(message.author.id);
            const premiumGuild = yield client.db.preGuild.get(String((_a = message.guild) === null || _a === void 0 ? void 0 : _a.id));
            const isPremium = (_b = (premiumUser && premiumUser.isPremium)) !== null && _b !== void 0 ? _b : false;
            const isPremiumGuild = (_c = (premiumGuild && premiumGuild.isPremium)) !== null && _c !== void 0 ? _c : false;
            const isOwner = message.author.id == client.owner;
            const isAdmin = client.config.bot.ADMIN.includes(message.author.id);
            const isBothUserAndGuild = command.accessableby.includes(Accessableby.GuildPremium) &&
                command.accessableby.includes(Accessableby.Premium);
            const userPerm = {
                owner: isOwner,
                admin: isOwner || isAdmin,
                premium: isOwner || isAdmin || isPremium,
                guildPre: isOwner || isAdmin || isPremium || isPremiumGuild,
            };
            if (command.accessableby.includes(Accessableby.Owner) && !userPerm.owner)
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "error", "owner_only")}`)
                            .setColor(client.color),
                    ],
                });
            if (command.accessableby.includes(Accessableby.Admin) && !userPerm.admin)
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "error", "user_no_perms", { perm: "dreamvast@admin" })}`)
                            .setColor(client.color),
                    ],
                });
            if (!isBothUserAndGuild &&
                command.accessableby.includes(Accessableby.Premium) &&
                !userPerm.premium) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.i18n.get(language, "error", "no_premium_author")}`,
                    iconURL: client.user.displayAvatarURL(),
                })
                    .setDescription(`${client.i18n.get(language, "error", "no_premium_desc")}`)
                    .setColor(client.color)
                    .setTimestamp();
                return message.reply({ content: " ", embeds: [embed] });
            }
            if (!isBothUserAndGuild &&
                command.accessableby.includes(Accessableby.GuildPremium) &&
                !userPerm.guildPre) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.i18n.get(language, "error", "no_premium_author")}`,
                    iconURL: client.user.displayAvatarURL(),
                })
                    .setDescription(`${client.i18n.get(language, "error", "no_guild_premium_desc")}`)
                    .setColor(client.color)
                    .setTimestamp();
                return message.reply({
                    content: " ",
                    embeds: [embed],
                });
            }
            const isNotPassAll = Object.values(userPerm).some((data) => data === false);
            if (command.accessableby.includes(Accessableby.Voter) && client.topgg && isNotPassAll) {
                const voteChecker = yield client.topgg.checkVote(message.author.id);
                if (voteChecker == TopggServiceEnum.ERROR) {
                    const embed = new EmbedBuilder()
                        .setAuthor({
                        name: client.i18n.get(language, "error", "topgg_error_author"),
                    })
                        .setDescription(client.i18n.get(language, "error", "topgg_error_desc"))
                        .setColor(client.color)
                        .setTimestamp();
                    return message.reply({ content: " ", embeds: [embed] });
                }
                if (voteChecker == TopggServiceEnum.UNVOTED) {
                    const embed = new EmbedBuilder()
                        .setAuthor({
                        name: client.i18n.get(language, "error", "topgg_vote_author"),
                    })
                        .setDescription(client.i18n.get(language, "error", "topgg_vote_desc"))
                        .setColor(client.color)
                        .setTimestamp();
                    const row = new ActionRowBuilder().addComponents(new ButtonBuilder()
                        .setLabel(client.i18n.get(language, "error", "topgg_vote_button"))
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://top.gg/bot/${(_d = client.user) === null || _d === void 0 ? void 0 : _d.id}/vote`));
                    return message.reply({ content: " ", embeds: [embed], components: [row] });
                }
            }
            //////////////////////////////// Check accessibility end ////////////////////////////////
            try {
                const handler = new CommandHandler({
                    message: message,
                    language: language,
                    client: client,
                    args: args,
                    prefix: PREFIX || client.prefix || "d!",
                });
                if (message.attachments.size !== 0)
                    handler.addAttachment(message.attachments);
                client.logger.info("CommandManager | Message", `[${command.name.join("-")}] used by ${message.author.username} from ${(_e = message.guild) === null || _e === void 0 ? void 0 : _e.name} (${(_f = message.guild) === null || _f === void 0 ? void 0 : _f.id})`);
                command.execute(client, handler);
            }
            catch (error) {
                client.logger.error("CommandManager | Message", error);
                message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "error", "unexpected_error")}\n ${error}`)
                            .setColor(client.color),
                    ],
                });
            }
        });
    }
}
