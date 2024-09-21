var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ClearMessageService } from "../../services/ClearMessageService.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { RainlinkPlayerState } from "../../rainlink/main.js";
export default class {
    execute(client, player) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client.isDatabaseConnected)
                return client.logger.warn(import.meta.url, "The database is not yet connected so this event will temporarily not execute. Please try again later!");
            const guild = yield client.guilds.fetch(player.guildId).catch(() => undefined);
            client.logger.info(import.meta.url, `Player End in @ ${guild.name} / ${player.guildId}`);
            /////////// Update Music Setup //////////
            yield client.UpdateMusic(player);
            /////////// Update Music Setup ///////////
            client.emit("playerEnd", player);
            let data = yield new AutoReconnectBuilderService(client, player).get(player.guildId);
            const channel = (yield client.channels.fetch(player.textId).catch(() => undefined));
            if (channel) {
                if (data && data.twentyfourseven)
                    return;
                if (player.queue.length || player.queue.current)
                    return new ClearMessageService(client, channel, player);
                if (player.loop !== "none")
                    return new ClearMessageService(client, channel, player);
            }
            const currentPlayer = client.rainlink.players.get(player.guildId);
            if (!currentPlayer)
                return;
            if (currentPlayer.state !== RainlinkPlayerState.DESTROYED)
                yield player.destroy();
        });
    }
}
