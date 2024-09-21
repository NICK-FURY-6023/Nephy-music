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
export class ButtonPause {
    constructor(client, interaction, channel, language, player) {
        this.channel = channel;
        this.client = client;
        this.language = language;
        this.player = player;
        this.interaction = interaction;
        this.execute();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.client.db.setup.get(`${this.player.guildId}`);
            if (!data)
                return;
            if (data.enable === false)
                return;
            if (!this.channel) {
                this.interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${this.client.getString(this.language, "error", "no_in_voice")}`)
                            .setColor(this.client.color),
                    ],
                });
                return;
            }
            else if (this.interaction.guild.members.me.voice.channel &&
                !this.interaction.guild.members.me.voice.channel.equals(this.channel)) {
                this.interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${this.client.getString(this.language, "error", "no_same_voice")}`)
                            .setColor(this.client.color),
                    ],
                });
                return;
            }
            else if (!this.player) {
                this.interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${this.client.getString(this.language, "error", "no_player")}`)
                            .setColor(this.client.color),
                    ],
                });
                return;
            }
            else {
                const getChannel = yield this.client.channels.fetch(data.channel).catch(() => undefined);
                if (!getChannel)
                    return;
                let playMsg = yield getChannel.messages.fetch(data.playmsg).catch(() => undefined);
                if (!playMsg)
                    return;
                const newPlayer = yield this.player.setPause(!this.player.paused);
                newPlayer.paused
                    ? playMsg.edit({
                        // content: playMsg.content,
                        // embeds: new EmbedBuilder(playMsg.embeds),
                        components: [this.client.enSwitch],
                    })
                    : playMsg.edit({
                        // content: playMsg.content,
                        // embeds: playMsg.embeds,
                        components: [this.client.enSwitchMod],
                    });
                const embed = new EmbedBuilder()
                    .setDescription(`${this.client.getString(this.language, "button.music", newPlayer.paused ? "pause_msg" : "resume_msg")}`)
                    .setColor(this.client.color);
                this.interaction.reply({ embeds: [embed] });
            }
        });
    }
}
