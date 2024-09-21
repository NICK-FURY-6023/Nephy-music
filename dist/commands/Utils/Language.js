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
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["language"];
        this.description = "Change the language for the bot";
        this.category = "Utils";
        this.accessableby = Accessableby.Manager;
        this.usage = "<language>";
        this.aliases = ["lang", "language"];
        this.lavalink = false;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: "input",
                description: "The new language",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const input = handler.args[0];
            const languages = client.i18n.getLocales();
            if (!languages.includes(input)) {
                const onsome = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.utils", "provide_lang", {
                    languages: languages.join(", "),
                })}`)
                    .setColor(client.color);
                return handler.editReply({ content: " ", embeds: [onsome] });
            }
            const newLang = yield client.db.language.get(`${handler.guild.id}`);
            if (!newLang) {
                yield client.db.language.set(`${handler.guild.id}`, input);
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.utils", "lang_set", {
                    language: String(input),
                })}`)
                    .setColor(client.color);
                return handler.editReply({ content: " ", embeds: [embed] });
            }
            else if (newLang) {
                yield client.db.language.set(`${handler.guild.id}`, input);
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.utils", "lang_change", {
                    language: String(input),
                })}`)
                    .setColor(client.color);
                return handler.editReply({ content: " ", embeds: [embed] });
            }
        });
    }
}
