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
import { SongNotiEnum } from "../../database/schema/SongNoti.js";
export default class {
    constructor() {
        this.name = ["songnoti"];
        this.description = "Enable or disable the player control notifications";
        this.category = "Utils";
        this.accessableby = Accessableby.Manager;
        this.usage = "<enable> or <disable>";
        this.aliases = ["song-noti", "snt", "sn"];
        this.lavalink = false;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: "type",
                description: "Choose enable or disable",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: "Enable",
                        value: "enable",
                    },
                    {
                        name: "Disable",
                        value: "disable",
                    },
                ],
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const value = handler.args[0];
            const originalValue = yield client.db.songNoti.get(`${handler.guild.id}`);
            if (value === "enable") {
                if (originalValue === SongNotiEnum.Enable)
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(handler.language, "command.utils", "songnoti_already", {
                                mode: handler.modeLang.enable,
                            })}`)
                                .setColor(client.color),
                        ],
                    });
                yield client.db.songNoti.set(`${handler.guild.id}`, SongNotiEnum.Enable);
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.utils", "songnoti_set", {
                    toggle: handler.modeLang.enable,
                })}`)
                    .setColor(client.color);
                return handler.editReply({ embeds: [embed] });
            }
            else if (value === "disable") {
                if (originalValue === SongNotiEnum.Disable)
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(handler.language, "command.utils", "songnoti_already", {
                                mode: handler.modeLang.disable,
                            })}`)
                                .setColor(client.color),
                        ],
                    });
                yield client.db.songNoti.set(`${handler.guild.id}`, SongNotiEnum.Disable);
                const embed = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.utils", "songnoti_set", {
                    toggle: handler.modeLang.disable,
                })}`)
                    .setColor(client.color);
                return handler.editReply({ embeds: [embed] });
            }
            else {
                const onsome = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "error", "arg_error", {
                    text: "**enable** or **disable**!",
                })}`)
                    .setColor(client.color);
                return handler.editReply({ content: " ", embeds: [onsome] });
            }
        });
    }
}
