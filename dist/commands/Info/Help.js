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
import { readdirSync } from "fs";
import { stripIndents } from "common-tags";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Accessableby } from "../../structures/Command.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
export default class {
    constructor() {
        this.name = ["help"];
        this.description = "Displays all commands that the bot has.";
        this.category = "Info";
        this.accessableby = Accessableby.Member;
        this.usage = "<commamnd_name>";
        this.aliases = ["h"];
        this.lavalink = false;
        this.usingInteraction = true;
        this.playerCheck = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: "command",
                description: "The command name",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            if (handler.args[0]) {
                const embed = new EmbedBuilder()
                    .setThumbnail(client.user.displayAvatarURL({ size: 2048 }))
                    .setColor(client.color);
                let command = client.commands.get(client.aliases.get(handler.args[0].toLowerCase()) || handler.args[0].toLowerCase());
                if (!command)
                    return handler.editReply({
                        embeds: [
                            embed.setTitle(`${client.getString(handler.language, "command.info", "ce_finder_invalid")}`).setDescription(`${client.getString(handler.language, "command.info", "ce_finder_example", {
                                command: `${handler.prefix}${this.name[0]}`,
                            })}`),
                        ],
                    });
                const eString = this.transalatedFinder(client, handler);
                embed.setDescription(stripIndents `
        ${eString.name} \`${command.name.join("-")}\`
        ${eString.des} \`${command.description || eString.desNone}\`
        ${eString.usage} ${command.usage
                    ? `\`${handler.prefix}${handler.interaction ? command.name.join(" ") : command.name.join("-")} ${command.usage}\``
                    : `\`${eString.usageNone}\``}
        ${eString.access} \`${command.accessableby}\`
        ${eString.aliases} \`${command.aliases && command.aliases.length !== 0
                    ? command.aliases.join(", ") + eString.aliasesPrefix
                    : eString.aliasesNone}\`
        ${eString.slash} \`${command.usingInteraction ? eString.slashEnable : eString.slashDisable}\`
        `);
                return handler.editReply({ embeds: [embed] });
            }
            const embedFieldArray = this.fieldArray(client, handler);
            const embed = new EmbedBuilder()
                .setThumbnail(client.user.displayAvatarURL({ size: 2048 }))
                .setColor(client.color)
                .setAuthor({
                name: `${client.getString(handler.language, "command.info", "ce_name")}`,
            })
                .addFields(embedFieldArray)
                .setFooter({
                text: `${client.getString(handler.language, "command.info", "ce_total")} ${client.commands.size}`,
                iconURL: client.user.displayAvatarURL(),
            });
            yield handler.editReply({ embeds: [embed] });
        });
    }
    fieldArray(client, handler) {
        const fieldRes = [];
        const categories = readdirSync(join(__dirname, "..", "..", "commands"));
        for (const category of categories) {
            const obj = {
                name: `❯  ${category.toUpperCase()} [${client.commands.filter((c) => c.category === category).size}]`,
                value: `${client.commands
                    .filter((c) => c.category === category)
                    .filter((c) => {
                    if (handler.interaction) {
                        return c.usingInteraction;
                    }
                    else {
                        return c;
                    }
                })
                    .map((c) => `\`${c.name.join("-")}\``)
                    .join(", ")}`,
                inline: false,
            };
            fieldRes.push(obj);
        }
        return fieldRes;
    }
    transalatedFinder(client, handler) {
        return {
            name: `${client.getString(handler.language, "command.info", "ce_finder_name")}`,
            des: `${client.getString(handler.language, "command.info", "ce_finder_des")}`,
            usage: `${client.getString(handler.language, "command.info", "ce_finder_usage")}`,
            access: `${client.getString(handler.language, "command.info", "ce_finder_access")}`,
            aliases: `${client.getString(handler.language, "command.info", "ce_finder_aliases")}`,
            slash: `${client.getString(handler.language, "command.info", "ce_finder_slash")}`,
            desNone: `${client.getString(handler.language, "command.info", "ce_finder_des_no")}`,
            usageNone: `${client.getString(handler.language, "command.info", "ce_finder_usage_no")}`,
            aliasesPrefix: `${client.getString(handler.language, "command.info", "ce_finder_aliases_prefix")}`,
            aliasesNone: `${client.getString(handler.language, "command.info", "ce_finder_aliases_no")}`,
            slashEnable: `${client.getString(handler.language, "command.info", "ce_finder_slash_enable")}`,
            slashDisable: `${client.getString(handler.language, "command.info", "ce_finder_slash_disable")}`,
        };
    }
}
