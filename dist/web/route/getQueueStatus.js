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
export function getQueueStatus(client, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        client.logger.info("StatusRouterService", `${req.method} ${req.routeOptions.url} params=${req.params ? util.inspect(req.params) : "{}"}`);
        const guildId = req.params["guildId"];
        const player = client.rainlink.players.get(guildId);
        if (!player) {
            res.code(400);
            res.send({ error: "Current player not found!" });
            return;
        }
        return res.send({
            data: player.queue.map((track) => {
                var _a;
                const requesterQueue = track.requester;
                return {
                    title: track.title,
                    uri: track.uri,
                    length: track.duration,
                    thumbnail: track.artworkUrl,
                    author: track.author,
                    requester: requesterQueue
                        ? {
                            id: requesterQueue.id,
                            username: requesterQueue.username,
                            globalName: requesterQueue.globalName,
                            defaultAvatarURL: (_a = requesterQueue.defaultAvatarURL) !== null && _a !== void 0 ? _a : null,
                        }
                        : null,
                };
            }),
        });
    });
}
