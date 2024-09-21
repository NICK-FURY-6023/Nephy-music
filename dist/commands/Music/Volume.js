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
// Main code
export default class {
    constructor() {
        this.name = ["volume"];
        this.description = "Adjusts the volume of the bot.";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "<number>";
        this.aliases = ["vol"];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
        this.options = [
            {
                name: "amount",
                description: "The amount of volume to set the bot to.",
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield handler.deferReply();
            const value = handler.args[0];
            if (value && isNaN(+value))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
                            .setColor(client.color),
                    ],
                });
            const player = client.rainlink.players.get(handler.guild.id);
            if (!value)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
                            .setColor(client.color),
                    ],
                });
            if (Number(value) <= 0 || Number(value) > 100)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "volume_invalid")}`)
                            .setColor(client.color),
                    ],
                });
            yield player.setVolume(Number(value));
            (_a = client.wsl.get(handler.guild.id)) === null || _a === void 0 ? void 0 : _a.send({
                op: "playerVolume",
                guild: handler.guild.id,
                volume: player.volume,
            });
            const changevol = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.music", "volume_msg", {
                volume: value,
            })}`)
                .setColor(client.color);
            handler.editReply({ content: " ", embeds: [changevol] });
        });
    }
}
