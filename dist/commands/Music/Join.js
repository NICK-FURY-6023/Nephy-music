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
// Main code
export default class {
    constructor() {
        this.name = ["join"];
        this.description = "Make the bot join the voice channel.";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = ["j"];
        this.lavalink = true;
        this.options = [];
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            yield handler.deferReply();
            const { channel } = handler.member.voice;
            if (!channel)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "error", "no_in_voice")}`)
                            .setColor(client.color),
                    ],
                });
            let player = client.rainlink.players.get(handler.guild.id);
            if (!player)
                player = yield client.rainlink.create({
                    guildId: handler.guild.id,
                    voiceId: handler.member.voice.channel.id,
                    textId: handler.channel.id,
                    shardId: (_b = (_a = handler.guild) === null || _a === void 0 ? void 0 : _a.shardId) !== null && _b !== void 0 ? _b : 0,
                    deaf: true,
                    volume: (_c = client.config.lavalink.DEFAULT_VOLUME) !== null && _c !== void 0 ? _c : 100,
                });
            else if (player && !this.checkSameVoice(client, handler, handler.language)) {
                return;
            }
            const embed = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.music", "join_msg", {
                channel: String(channel),
            })}`)
                .setColor(client.color);
            handler.editReply({ content: " ", embeds: [embed] });
        });
    }
    checkSameVoice(client, handler, language) {
        if (handler.member.voice.channel !== handler.guild.members.me.voice.channel) {
            handler.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${client.getString(handler.language, "error", "no_same_voice")}`)
                        .setColor(client.color),
                ],
            });
            return false;
        }
        else if (handler.member.voice.channel === handler.guild.members.me.voice.channel) {
            handler.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${client.getString(handler.language, "command.music", "join_already", {
                        channel: String(handler.member.voice.channel),
                    })}`)
                        .setColor(client.color),
                ],
            });
            return false;
        }
        return true;
    }
}
