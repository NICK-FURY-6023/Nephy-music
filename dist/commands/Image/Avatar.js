var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Accessableby } from "../../structures/Command.js";
import { ParseMentionEnum } from "../../structures/CommandHandler.js";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
export default class {
    constructor() {
        this.name = ["avatar"];
        this.description = "Show your or someone else's profile picture";
        this.category = "Image";
        this.accessableby = Accessableby.Member;
        this.usage = "<mention>";
        this.aliases = [];
        this.lavalink = false;
        this.usingInteraction = true;
        this.playerCheck = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: "user",
                description: "Type your user here",
                type: ApplicationCommandOptionType.User,
                required: false,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield handler.deferReply();
            const data = handler.args[0];
            const getData = yield handler.parseMentions(data);
            if (data && getData && getData.type !== ParseMentionEnum.USER)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "arg_error", {
                            text: "**@mention**!",
                        })}`)
                            .setColor(client.color),
                    ],
                });
            const value = getData.data;
            if (value && value !== "error") {
                const embed = new EmbedBuilder()
                    .setTitle(value.username)
                    .setImage(`https://cdn.discordapp.com/avatars/${value.id}/${value.avatar}.jpeg?size=300`)
                    .setColor(client.color)
                    .setTimestamp();
                yield handler.editReply({ embeds: [embed] });
            }
            else {
                const embed = new EmbedBuilder()
                    .setTitle(handler.user.username)
                    .setImage(`https://cdn.discordapp.com/avatars/${(_a = handler.user) === null || _a === void 0 ? void 0 : _a.id}/${(_b = handler.user) === null || _b === void 0 ? void 0 : _b.avatar}.jpeg?size=300`)
                    .setColor(client.color)
                    .setTimestamp();
                yield handler.editReply({ embeds: [embed] });
            }
        });
    }
}
