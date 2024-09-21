var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import util from "node:util";
export function getMemberStatus(client, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        client.logger.info("StatusRouterService", `${req.method} ${req.routeOptions.url} params=${req.params ? util.inspect(req.params) : "{}"}`);
        let isMemeberInVoice = false;
        const guildId = req.params["guildId"];
        const player = client.rainlink.players.get(guildId);
        if (!player) {
            res.code(400);
            res.send({ error: "Current player not found!" });
            return;
        }
        const userId = req.headers["user-id"];
        const Guild = yield client.guilds.fetch(guildId).catch(() => undefined);
        if (!Guild) {
            res.code(400);
            res.send({ error: "Guild not found" });
            return;
        }
        const Member = yield Guild.members.fetch(userId).catch(() => undefined);
        if (Member && Member.voice.channel && Member.voice)
            isMemeberInVoice = true;
        res.send({ data: isMemeberInVoice });
        return;
    });
}
