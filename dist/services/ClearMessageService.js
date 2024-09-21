var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class ClearMessageService {
    constructor(client, channel, player) {
        this.channel = channel;
        this.client = client;
        this.player = player;
        this.execute();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const nplayingMsg = this.client.nplayingMsg.get(this.player.guildId);
                if (!nplayingMsg)
                    return;
                nplayingMsg.coll.stop();
                nplayingMsg.msg.delete().catch(() => null);
                this.client.nplayingMsg.delete(this.player.guildId);
            }
            catch (err) { }
        });
    }
}
