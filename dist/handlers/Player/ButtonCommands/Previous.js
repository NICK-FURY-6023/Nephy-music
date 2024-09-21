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
export class ButtonPrevious {
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
            else if (!this.player || this.player.queue.previous.length == 0) {
                this.interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${this.client.getString(this.language, "button.music", "previous_notfound")}`)
                            .setColor(this.client.color),
                    ],
                });
                return;
            }
            else {
                this.player.previous();
                this.player.data.set("endMode", "previous");
                const embed = new EmbedBuilder()
                    .setDescription(`${this.client.getString(this.language, "button.music", "previous_msg")}`)
                    .setColor(this.client.color);
                this.interaction.reply({ embeds: [embed] });
            }
        });
    }
}
