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
export class ReplyInteractionService {
    constructor(client, message, content) {
        this.client = client;
        this.content = content;
        this.message = message;
        this.execute();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const embed = new EmbedBuilder().setDescription(this.content).setColor(this.client.color);
                const msg = yield this.message.reply({
                    embeds: [embed],
                    ephemeral: false,
                });
                const setup = yield this.client.db.setup.get(String(this.message.guildId));
                setTimeout(() => {
                    !setup || setup == null || setup.channel !== this.message.channelId ? msg.delete().catch(() => null) : true;
                }, this.client.config.bot.DELETE_MSG_TIMEOUT);
            }
            catch (err) { }
        });
    }
}
