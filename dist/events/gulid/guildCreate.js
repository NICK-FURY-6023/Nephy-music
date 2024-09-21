var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { stripIndents } from "common-tags";
import { EmbedBuilder } from "discord.js";
import fs from "fs";
export default class {
    execute(client, guild) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            client.logger.info(import.meta.url, `Joined guild ${guild.name} @ ${guild.id}`);
            const owner = yield guild.fetchOwner();
            const language = client.config.bot.LANGUAGE;
            client.guilds.cache.set(`${guild.id}`, guild);
            try {
                let PREFIX = client.prefix;
                const GuildPrefix = yield client.db.prefix.get(`${guild.id}`);
                if (GuildPrefix)
                    PREFIX = GuildPrefix;
                else if (!GuildPrefix)
                    PREFIX = String(yield client.db.prefix.set(`${guild.id}`, client.prefix));
                const userDm = yield owner.createDM(true);
                userDm.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${client.getString(language, "event.guild", "join_dm_title", {
                            username: String((_a = client.user) === null || _a === void 0 ? void 0 : _a.username),
                        })}`)
                            .setDescription(stripIndents `
              ${client.getString(language, "event.message", "intro1", {
                            bot: String((_b = client.user) === null || _b === void 0 ? void 0 : _b.displayName),
                        })}
              ${client.getString(language, "event.message", "intro2")}
              ${client.getString(language, "event.message", "intro3")}
              ${client.getString(language, "event.message", "prefix", {
                            prefix: `\`${PREFIX}\` or \`/\``,
                        })}
              ${client.getString(language, "event.message", "help1", {
                            help: `\`${PREFIX}help\` or \`/help\``,
                        })}
              ${client.getString(language, "event.message", "help2", {
                            botinfo: `\`${PREFIX}status\` or \`/status\``,
                        })}
              ${client.getString(language, "event.message", "ver", {
                            botver: client.metadata.version,
                        })}
              ${client.getString(language, "event.message", "djs", {
                            djsver: JSON.parse(yield fs.readFileSync("package.json", "utf-8")).dependencies["discord.js"],
                        })}
              ${client.getString(language, "event.message", "lavalink", {
                            aver: client.metadata.autofix,
                        })}
              ${client.getString(language, "event.message", "codename", {
                            codename: client.metadata.codename,
                        })}
            `)
                            .setColor(client.color),
                    ],
                });
            }
            catch (err) { }
            if (!client.config.features.GUILD_LOG_CHANNEL)
                return;
            try {
                const eventChannel = yield client.channels.fetch(client.config.features.GUILD_LOG_CHANNEL).catch(() => undefined);
                if (!eventChannel || !eventChannel.isTextBased())
                    return;
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.getString(language, "event.guild", "joined_title")}`,
                })
                    .addFields([
                    {
                        name: `${client.getString(language, "event.guild", "guild_name")}`,
                        value: String(guild.name),
                    },
                    {
                        name: `${client.getString(language, "event.guild", "guild_id")}`,
                        value: String(guild.id),
                    },
                    {
                        name: `${client.getString(language, "event.guild", "guild_owner")}`,
                        value: `${owner.displayName} [ ${guild.ownerId} ]`,
                    },
                    {
                        name: `${client.getString(language, "event.guild", "guild_member_count")}`,
                        value: `${guild.memberCount}`,
                    },
                    {
                        name: `${client.getString(language, "event.guild", "guild_creation_date")}`,
                        value: `${guild.createdAt}`,
                    },
                    {
                        name: `${client.getString(language, "event.guild", "current_server_count")}`,
                        value: `${client.guilds.cache.size}`,
                    },
                ])
                    .setTimestamp()
                    .setColor(client.color);
                eventChannel.messages.channel.send({ embeds: [embed] });
            }
            catch (err) { }
        });
    }
}
