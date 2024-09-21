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
import { RainlinkLoopMode } from "../../rainlink/main.js";
export default class {
    constructor() {
        this.name = ["loop"];
        this.description = "Loop song in queue type all/current!";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "<mode>";
        this.aliases = [];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
        this.options = [
            {
                name: "type",
                description: "Type of loop",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: "Song",
                        value: "song",
                    },
                    {
                        name: "Queue",
                        value: "queue",
                    },
                    {
                        name: "None",
                        value: "none",
                    },
                ],
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield handler.deferReply();
            const player = client.rainlink.players.get(handler.guild.id);
            const mode_array = ["song", "queue", "none"];
            const mode = handler.args[0];
            if (!mode_array.includes(mode))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "loop_invalid", {
                            mode: this.changeBold(mode_array).join(", "),
                        })}`)
                            .setColor(client.color),
                    ],
                });
            if ((mode == "song" && player.loop == RainlinkLoopMode.SONG) || mode == player.loop)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.getString(handler.language, "command.music", "loop_already", {
                            mode: mode,
                        })}`)
                            .setColor(client.color),
                    ],
                });
            if (mode == "song") {
                player.setLoop(RainlinkLoopMode.SONG);
                this.setLoop247(client, player, RainlinkLoopMode.SONG);
                const looped = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "loop_current")}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [looped] });
            }
            else if (mode == "queue") {
                player.setLoop(RainlinkLoopMode.QUEUE);
                this.setLoop247(client, player, RainlinkLoopMode.QUEUE);
                const looped_queue = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "loop_all")}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [looped_queue] });
            }
            else if (mode === "none") {
                yield player.setLoop(RainlinkLoopMode.NONE);
                this.setLoop247(client, player, RainlinkLoopMode.NONE);
                const looped = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "unloop_all")}`)
                    .setColor(client.color);
                handler.editReply({ content: " ", embeds: [looped] });
            }
            (_a = client.wsl.get(handler.guild.id)) === null || _a === void 0 ? void 0 : _a.send({
                op: "playerLoop",
                guild: handler.guild.id,
                mode: mode,
            });
        });
    }
    setLoop247(client, player, loop) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield new AutoReconnectBuilderService(client, player).execute(player.guildId);
            if (data) {
                yield client.db.autoreconnect.set(`${player.guildId}.config.loop`, loop);
            }
        });
    }
    changeBold(arrayMode) {
        const res = [];
        for (const data of arrayMode) {
            res.push(`**${data}**`);
        }
        return res;
    }
}
