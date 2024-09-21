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
export default class {
    constructor() {
        this.name = ["shutdown"];
        this.description = "Shuts down the client!";
        this.category = "Owner";
        this.accessableby = Accessableby.Owner;
        this.usage = "";
        this.aliases = ["shutdown"];
        this.lavalink = false;
        this.usingInteraction = true;
        this.playerCheck = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const restart = new EmbedBuilder()
                .setDescription(`${client.getString(handler.language, "command.utils", "restart_msg")}`)
                .setColor(client.color)
                .setFooter({
                text: `${handler.guild.members.me.displayName}`,
                iconURL: client.user.displayAvatarURL(),
            });
            yield handler.editReply({ embeds: [restart] });
            process.exit();
        });
    }
}
