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
        this.name = ["autoplay"];
        this.description = "Autoplay music (Random play songs)";
        this.category = "Music";
        this.accessableby = Accessableby.Member;
        this.usage = "";
        this.aliases = [];
        this.lavalink = true;
        this.options = [];
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = true;
        this.permissions = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            yield handler.deferReply();
            const player = client.rainlink.players.get(handler.guild.id);
            if (player.data.get("autoplay") === true) {
                player.data.set("autoplay", false);
                player.data.set("identifier", null);
                player.data.set("requester", null);
                player.queue.clear();
                const off = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "autoplay_off", {
                    mode: handler.modeLang.disable,
                })}`)
                    .setColor(client.color);
                yield handler.editReply({ content: " ", embeds: [off] });
            }
            else {
                const identifier = player.queue.current.identifier;
                player.data.set("autoplay", true);
                player.data.set("identifier", identifier);
                player.data.set("requester", handler.user);
                player.data.set("source", (_a = player.queue.current) === null || _a === void 0 ? void 0 : _a.source);
                player.data.set("author", (_b = player.queue.current) === null || _b === void 0 ? void 0 : _b.author);
                player.data.set("title", (_c = player.queue.current) === null || _c === void 0 ? void 0 : _c.title);
                const on = new EmbedBuilder()
                    .setDescription(`${client.getString(handler.language, "command.music", "autoplay_on", {
                    mode: handler.modeLang.enable,
                })}`)
                    .setColor(client.color);
                yield handler.editReply({ content: " ", embeds: [on] });
            }
        });
    }
}
