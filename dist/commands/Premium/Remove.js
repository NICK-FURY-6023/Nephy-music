var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["pm", "remove"];
        this.description = "Remove premium from members!";
        this.category = "Premium";
        this.accessableby = Accessableby.Admin;
        this.usage = "<id>";
        this.aliases = ["prm"];
        this.lavalink = false;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: "id",
                description: "The user id you want to remove!",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield handler.deferReply();
            const id = handler.args[0];
            if (!id)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.premium", "remove_no_params")}`)
                            .setColor(client.color),
                    ],
                });
            const db = yield client.db.premium.get(`${id}`);
            if (!db)
                return handler.editReply({
                    content: `${client.getString(handler.language, "command.premium", "remove_404", {
                        userid: id,
                    })}`,
                });
            if (db.isPremium) {
                yield client.db.premium.delete(`${id}`);
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.premium", "remove_desc", {
                    user: (_a = db.redeemedBy) === null || _a === void 0 ? void 0 : _a.username,
                })}`)
                    .setColor(client.color);
                handler.editReply({ embeds: [embed] });
            }
            else {
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.premium", "remove_already", {
                    user: (_b = db.redeemedBy) === null || _b === void 0 ? void 0 : _b.username,
                })}`)
                    .setColor(client.color);
                handler.editReply({ embeds: [embed] });
            }
        });
    }
}
