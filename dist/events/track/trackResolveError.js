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
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { ClearMessageService } from "../../services/ClearMessageService.js";
import { RainlinkPlayerState } from "../../rainlink/main.js";
export default class {
    execute(client, player, track, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client.isDatabaseConnected)
                return client.logger.warn(import.meta.url, "The database is not yet connected so this event will temporarily not execute. Please try again later!");
            const guild = yield client.guilds.fetch(player.guildId).catch(() => undefined);
            client.logger.error(import.meta.url, message);
            /////////// Update Music Setup //////////
            yield client.UpdateMusic(player);
            /////////// Update Music Setup ///////////
            const channel = (yield client.channels.fetch(player.textId).catch(() => undefined));
            let guildModel = yield client.db.language.get(`${player.guildId}`);
            if (!guildModel) {
                guildModel = yield client.db.language.set(`${player.guildId}`, client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.getString(language, "event.player", "error_desc")}`);
            if (channel) {
                const setup = yield client.db.setup.get(player.guildId);
                const msg = yield channel.send({ embeds: [embed] });
                setTimeout(() => __awaiter(this, void 0, void 0, function* () { return (!setup || setup == null || setup.channel !== channel.id ? msg.delete().catch(() => null) : true); }), client.config.bot.DELETE_MSG_TIMEOUT);
            }
            client.logger.error(import.meta.url, `Track Error in ${guild.name} / ${player.guildId}.`);
            const data247 = yield new AutoReconnectBuilderService(client, player).get(player.guildId);
            if (data247 !== null && data247 && data247.twentyfourseven && channel)
                new ClearMessageService(client, channel, player);
            const currentPlayer = client.rainlink.players.get(player.guildId);
            if (!currentPlayer)
                return;
            if (currentPlayer.state !== RainlinkPlayerState.DESTROYED)
                yield player.destroy();
        });
    }
}
