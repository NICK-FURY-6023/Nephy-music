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
        this.name = 'replay';
    }
    run(client, message, language, player, nplaying, collector) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player) {
                collector.stop();
            }
            const previousIndex = player.queue.previous.length - 1;
            if (player.queue.previous.length == 0 || previousIndex === -1)
                return new ReplyInteractionService(client, message, `${client.i18n.get(language, 'button.music', 'previous_notfound')}`);
            player.previous();
            player.data.set('endMode', 'previous');
            new ReplyInteractionService(client, message, `${client.i18n.get(language, 'button.music', 'previous_msg')}`);
            return;
        });
    }
}
