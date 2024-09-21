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
import { RainlinkLoopMode } from '../rainlink/main.js';
export default class {
    constructor() {
        this.name = 'loop';
    }
    run(client, message, language, player, nplaying, collector) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!player) {
                collector.stop();
            }
            function setLoop247(loop) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (yield client.db.autoreconnect.get(player.guildId)) {
                        yield client.db.autoreconnect.set(`${player.guildId}.config.loop`, loop);
                    }
                });
            }
            switch (player.loop) {
                case 'none':
                    player.setLoop(RainlinkLoopMode.SONG);
                    if (client.config.utilities.AUTO_RESUME)
                        setLoop247(RainlinkLoopMode.SONG);
                    new ReplyInteractionService(client, message, `${client.i18n.get(language, 'button.music', 'loop_current')}`);
                    (_a = client.wsl.get(message.guild.id)) === null || _a === void 0 ? void 0 : _a.send({
                        op: 'playerLoop',
                        guild: message.guild.id,
                        mode: 'song',
                    });
                    break;
                case 'song':
                    player.setLoop(RainlinkLoopMode.QUEUE);
                    if (client.config.utilities.AUTO_RESUME)
                        setLoop247(RainlinkLoopMode.QUEUE);
                    new ReplyInteractionService(client, message, `${client.i18n.get(language, 'button.music', 'loop_all')}`);
                    (_b = client.wsl.get(message.guild.id)) === null || _b === void 0 ? void 0 : _b.send({
                        op: 'playerLoop',
                        guild: message.guild.id,
                        mode: 'queue',
                    });
                    break;
                case 'queue':
                    player.setLoop(RainlinkLoopMode.NONE);
                    if (client.config.utilities.AUTO_RESUME)
                        setLoop247(RainlinkLoopMode.NONE);
                    new ReplyInteractionService(client, message, `${client.i18n.get(language, 'button.music', 'unloop_all')}`);
                    (_c = client.wsl.get(message.guild.id)) === null || _c === void 0 ? void 0 : _c.send({
                        op: 'playerLoop',
                        guild: message.guild.id,
                        mode: 'none',
                    });
                    break;
            }
        });
    }
}
