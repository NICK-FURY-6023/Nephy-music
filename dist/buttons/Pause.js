var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { filterSelect, playerRowOne, playerRowOneEdited, playerRowTwo, } from '../utilities/PlayerControlButton.js';
import { ReplyInteractionService } from '../services/ReplyInteractionService.js';
export default class {
    constructor() {
        this.name = 'pause';
    }
    run(client, message, language, player, nplaying, collector) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player) {
                collector.stop();
            }
            const newPlayer = yield player.setPause(!player.paused);
            newPlayer.paused
                ? nplaying
                    .edit({
                    components: [playerRowOneEdited(client), playerRowTwo(client), filterSelect(client)],
                })
                    .catch(() => null)
                : nplaying
                    .edit({
                    components: [playerRowOne(client), playerRowTwo(client), filterSelect(client)],
                })
                    .catch(() => null);
            new ReplyInteractionService(client, message, `${client.i18n.get(language, 'button.music', newPlayer.paused ? 'pause_msg' : 'resume_msg')}`);
        });
    }
}
