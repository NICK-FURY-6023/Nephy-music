var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder } from "discord.js";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["prefix"];
        this.description = "Change the prefix for the bot";
        this.category = "Utils";
        this.accessableby = Accessableby.Manager;
        this.usage = "<input>";
        this.aliases = ["setprefix"];
        this.lavalink = false;
        this.playerCheck = false;
        this.usingInteraction = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            if (!handler.args[0])
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.utils", "prefix_arg")}`)
                            .setColor(client.color),
                    ],
                });
            if (handler.args[0].length > 10)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.utils", "prefix_length")}`)
                            .setColor(client.color),
                    ],
                });
            const newPrefix = yield client.db.prefix.get(`${handler.guild.id}`);
            if (!newPrefix) {
                yield client.db.prefix.set(`${handler.guild.id}`, handler.args[0]);
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.utils", "prefix_set", {
                    prefix: handler.args[0],
                })}`)
                    .setColor(client.color);
                return handler.editReply({ embeds: [embed] });
            }
            else if (newPrefix) {
                yield client.db.prefix.set(`${handler.guild.id}`, handler.args[0]);
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.utils", "prefix_change", {
                    prefix: handler.args[0],
                })}`)
                    .setColor(client.color);
                return handler.editReply({ embeds: [embed] });
            }
        });
    }
}
