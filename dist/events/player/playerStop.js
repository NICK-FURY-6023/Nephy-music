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
import { ClearMessageService } from "../../services/ClearMessageService.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
export default class {
    execute(client, player) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client.isDatabaseConnected)
                return client.logger.warn(import.meta.url, "The database is not yet connected so this event will temporarily not execute. Please try again later!");
            const guild = yield client.guilds.fetch(player.guildId).catch(() => undefined);
            client.logger.info(import.meta.url, `Player Stop in @ ${guild.name} / ${player.guildId}`);
            /////////// Update Music Setup //////////
            yield client.UpdateMusic(player);
            /////////// Update Music Setup ///////////
            const channel = (yield client.channels.fetch(player.textId).catch(() => undefined));
            client.sentQueue.set(player.guildId, false);
            const autoreconnectService = new AutoReconnectBuilderService(client, player);
            let data = yield autoreconnectService.get(player.guildId);
            if (!channel)
                return;
            if (data !== null && data && data.twentyfourseven)
                yield autoreconnectService.build247(player.guildId, true, data.voice);
            let guildModel = yield client.db.language.get(`${channel.guild.id}`);
            if (!guildModel) {
                guildModel = yield client.db.language.set(`${channel.guild.id}`, client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            const isSudoDestroy = player.data.get("sudo-destroy");
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.getString(language, "event.player", "queue_end_desc")}`);
            if (!isSudoDestroy) {
                const setup = yield client.db.setup.get(player.guildId);
                const msg = yield channel.send({ embeds: [embed] });
                setTimeout(() => __awaiter(this, void 0, void 0, function* () { return (!setup || setup == null || setup.channel !== channel.id ? msg.delete().catch(() => null) : true); }), client.config.bot.DELETE_MSG_TIMEOUT);
            }
            const setupdata = yield client.db.setup.get(`${player.guildId}`);
            if ((setupdata === null || setupdata === void 0 ? void 0 : setupdata.channel) == player.textId)
                return;
            new ClearMessageService(client, channel, player);
            player.data.clear();
        });
    }
}
