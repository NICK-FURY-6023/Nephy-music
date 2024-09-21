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
export class RatelimitReplyService {
    constructor(options) {
        this.language = options.language;
        this.client = options.client;
        this.interaction = options.interaction;
        this.button = options.button;
        this.message = options.message;
        this.time = options.time;
    }
    reply() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.interaction) {
                const setup = yield this.client.db.setup.get(this.interaction.guildId);
                const msg = yield this.interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${this.client.getString(this.language, "error", "ratelimit", {
                            time: String(this.time),
                        })}`)
                            .setColor(this.client.color),
                    ],
                });
                if (!setup || setup == null || setup.channel !== this.interaction.channelId)
                    setTimeout(() => msg.delete().catch(() => null), this.client.config.bot.DELETE_MSG_TIMEOUT);
                return;
            }
            if (this.button) {
                const setup = yield this.client.db.setup.get(this.button.guildId);
                const msg = yield this.button.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${this.client.getString(this.language, "error", "ratelimit", {
                            time: String(this.time),
                        })}`)
                            .setColor(this.client.color),
                    ],
                });
                if (!setup || setup == null || setup.channel !== this.button.channelId)
                    setTimeout(() => msg.delete().catch(() => null), this.client.config.bot.DELETE_MSG_TIMEOUT);
                return;
            }
            if (this.message) {
                const setup = yield this.client.db.setup.get(this.message.guildId);
                const msg = yield this.message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${this.client.getString(this.language, "error", "ratelimit", {
                            time: String(this.time),
                        })}`)
                            .setColor(this.client.color),
                    ],
                });
                if (!setup || setup == null || setup.channel !== this.message.channelId)
                    setTimeout(() => msg.delete().catch(() => null), this.client.config.bot.DELETE_MSG_TIMEOUT);
                return;
            }
        });
    }
}
