var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ReplyInteractionService } from '../services/ReplyInteractionService.js';
export default class {
    constructor() {
        this.name = 'volup';
    }
    run(client, message, language, player, nplaying, collector) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!player) {
                collector.stop();
            }
            const reply_msg = `${client.i18n.get(language, 'button.music', 'volup_msg', {
                volume: `${player.volume + 10}`,
            })}`;
            if (player.volume >= 100) {
                new ReplyInteractionService(client, message, `${client.i18n.get(language, 'button.music', 'volume_max')}`);
                return;
            }
            player.setVolume(player.volume + 10);
            (_a = client.wsl.get(message.guild.id)) === null || _a === void 0 ? void 0 : _a.send({
                op: 'playerVolume',
                guild: message.guild.id,
                volume: player.volume,
            });
            new ReplyInteractionService(client, message, reply_msg);
            return;
        });
    }
}
