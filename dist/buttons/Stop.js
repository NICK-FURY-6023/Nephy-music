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
        this.name = 'stop';
    }
    run(client, message, language, player, nplaying, collector) {
        return __awaiter(this, void 0, void 0, function* () {
            collector.stop();
            player.data.set('sudo-destroy', true);
            const is247 = yield client.db.autoreconnect.get(`${message.guildId}`);
            player.stop(is247 && is247.twentyfourseven ? false : true);
            new ReplyInteractionService(client, message, `${client.i18n.get(language, 'button.music', 'stop_msg')}`);
        });
    }
}
