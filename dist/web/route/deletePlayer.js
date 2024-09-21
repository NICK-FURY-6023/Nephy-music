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
export function deletePlayer(client, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        client.logger.info("PlayerRouterService", `${req.method} ${req.routeOptions.url} params=${req.params ? util.inspect(req.params) : "{}"}`);
        const guildId = req.params["guildId"];
        const player = client.rainlink.players.get(guildId);
        if (!player) {
            res.code(404);
            res.send({ error: "Current player not found!" });
            return;
        }
        yield player.destroy();
        res.code(204);
    });
}
