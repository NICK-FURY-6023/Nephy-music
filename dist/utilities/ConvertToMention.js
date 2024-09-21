import { ApplicationCommandOptionType } from "discord.js";
export class ConvertToMention {
    execute(data) {
        if (data.type == ApplicationCommandOptionType.User) {
            return `<@${data.value}>`;
        }
        else if (data.type == ApplicationCommandOptionType.Role) {
            return `<@&${data.value}>`;
        }
        else if (data.type == ApplicationCommandOptionType.Channel) {
            return `<#${data.value}>`;
        }
        else {
            return "error";
        }
    }
}
