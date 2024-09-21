var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { playerRowOneEdited, playerRowTwo } from "../../assets/PlayerControlButton.js";
export default class {
    execute(client, player) {
        return __awaiter(this, void 0, void 0, function* () {
            if (player.voiceId == null)
                return;
            const nowPlaying = client.nplayingMsg.get(`${player.guildId}`);
            if (nowPlaying) {
                nowPlaying.msg.edit({ components: [playerRowOneEdited, playerRowTwo] });
            }
            const setup = yield client.db.setup.get(`${player.guildId}`);
            client.emit("playerPause", player);
            if (setup && setup.playmsg) {
                const channel = yield client.channels.fetch(setup.channel).catch(() => undefined);
                if (!channel)
                    return;
                if (!channel.isTextBased)
                    return;
                const msg = yield channel.messages.fetch(setup.playmsg).catch(() => undefined);
                if (!msg)
                    return;
                msg.edit({ components: [client.enSwitch] });
            }
        });
    }
}
