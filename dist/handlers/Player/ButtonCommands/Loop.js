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
import { AutoReconnectBuilderService } from "../../../services/AutoReconnectBuilderService.js";
import { RainlinkLoopMode } from "../../../rainlink/main.js";
export class ButtonLoop {
    constructor(client, interaction, language, player) {
        this.client = client;
        this.language = language;
        this.player = player;
        this.interaction = interaction;
        this.execute();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!this.player) {
                return;
            }
            switch (this.player.loop) {
                case "none":
                    yield this.player.setLoop(RainlinkLoopMode.SONG);
                    this.setLoop247(String(RainlinkLoopMode.SONG));
                    const looptrack = new EmbedBuilder()
                        .setDescription(`${this.client.getString(this.language, "button.music", "loop_current")}`)
                        .setColor(this.client.color);
                    yield this.interaction.reply({
                        content: " ",
                        embeds: [looptrack],
                    });
                    (_a = this.client.wsl.get(this.interaction.guild.id)) === null || _a === void 0 ? void 0 : _a.send({
                        op: "playerLoop",
                        guild: this.interaction.guild.id,
                        mode: "song",
                    });
                    break;
                case "song":
                    yield this.player.setLoop(RainlinkLoopMode.QUEUE);
                    this.setLoop247(String(RainlinkLoopMode.QUEUE));
                    const loopall = new EmbedBuilder()
                        .setDescription(`${this.client.getString(this.language, "button.music", "loop_all")}`)
                        .setColor(this.client.color);
                    yield this.interaction.reply({
                        content: " ",
                        embeds: [loopall],
                    });
                    (_b = this.client.wsl.get(this.interaction.guild.id)) === null || _b === void 0 ? void 0 : _b.send({
                        op: "playerLoop",
                        guild: this.interaction.guild.id,
                        mode: "queue",
                    });
                    break;
                case "queue":
                    yield this.player.setLoop(RainlinkLoopMode.NONE);
                    this.setLoop247(String(RainlinkLoopMode.NONE));
                    const unloopall = new EmbedBuilder()
                        .setDescription(`${this.client.getString(this.language, "button.music", "unloop_all")}`)
                        .setColor(this.client.color);
                    yield this.interaction.reply({
                        content: " ",
                        embeds: [unloopall],
                    });
                    (_c = this.client.wsl.get(this.interaction.guild.id)) === null || _c === void 0 ? void 0 : _c.send({
                        op: "playerLoop",
                        guild: this.interaction.guild.id,
                        mode: "none",
                    });
                    break;
            }
        });
    }
    setLoop247(loop) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield new AutoReconnectBuilderService(this.client, this.player).execute(this.player.guildId);
            if (check) {
                yield this.client.db.autoreconnect.set(`${this.player.guildId}.config.loop`, loop);
            }
        });
    }
}
