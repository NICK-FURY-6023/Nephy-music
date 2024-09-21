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
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { Accessableby } from "../../structures/Command.js";
export default class {
    constructor() {
        this.name = ["247"];
        this.description = "24/7 in voice channel";
        this.category = "Utils";
        this.accessableby = Accessableby.Manager;
        this.usage = "<enable> or <disable>";
        this.aliases = [];
        this.lavalink = true;
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
        this.playerCheck = false;
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            yield handler.deferReply();
            let player = client.rainlink.players.get(handler.guild.id);
            const value = handler.args[0];
            const reconnectBuilder = new AutoReconnectBuilderService(client, player);
            const data = yield reconnectBuilder.execute((_a = handler.guild) === null || _a === void 0 ? void 0 : _a.id);
            if (value == "disable") {
                if (!data.twentyfourseven) {
                    const offAl = new EmbedBuilder()
                        .setDescription(`${client.getString(handler.language, "command.utils", "247_already", {
                        mode: handler.modeLang.disable,
                    })}`)
                        .setColor(client.color);
                    return handler.editReply({ content: " ", embeds: [offAl] });
                }
                data.current || data.current.length !== 0
                    ? yield client.db.autoreconnect.set(`${handler.guild.id}.twentyfourseven`, false)
                    : yield client.db.autoreconnect.delete(`${handler.guild.id}`);
                player ? player.data.set("sudo-destroy", true) : true;
                player && player.voiceId && handler.member.voice.channel == null ? player.destroy() : true;
                const on = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.utils", "247_off")}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [on] });
            }
            else if (value == "enable") {
                const { channel } = handler.member.voice;
                if (!channel || handler.member.voice.channel == null)
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.getString(handler.language, "error", "no_in_voice")}`)
                                .setColor(client.color),
                        ],
                    });
                if (data.twentyfourseven) {
                    const onAl = new EmbedBuilder()
                        .setDescription(`${client.getString(handler.language, "command.utils", "247_already", {
                        mode: handler.modeLang.enable,
                    })}`)
                        .setColor(client.color);
                    return handler.editReply({ content: " ", embeds: [onAl] });
                }
                if (!player)
                    player = yield client.rainlink.create({
                        guildId: handler.guild.id,
                        voiceId: handler.member.voice.channel.id,
                        textId: String((_b = handler.channel) === null || _b === void 0 ? void 0 : _b.id),
                        shardId: (_d = (_c = handler.guild) === null || _c === void 0 ? void 0 : _c.shardId) !== null && _d !== void 0 ? _d : 0,
                        deaf: true,
                        volume: (_e = client.config.lavalink.DEFAULT_VOLUME) !== null && _e !== void 0 ? _e : 100,
                    });
                data.voice
                    ? yield client.db.autoreconnect.set(`${handler.guild.id}.twentyfourseven`, true)
                    : new AutoReconnectBuilderService(client, player).playerBuild(player === null || player === void 0 ? void 0 : player.guildId, true);
                const on = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.utils", "247_on")}`)
                    .setColor(client.color);
                return handler.editReply({ content: " ", embeds: [on] });
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
