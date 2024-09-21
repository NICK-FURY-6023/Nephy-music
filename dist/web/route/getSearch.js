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
import { RainlinkSearchResultType } from "../../rainlink/main.js";
export function getSearch(client, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        client.logger.info("SearchRouterService", `${req.method} ${req.routeOptions.url} query=${req.query ? util.inspect(req.query) : "{}"}`);
        const query = req.query["identifier"];
        const requester = req.query["requester"];
        const source = req.query["source"];
        let validSource = "youtube";
        if (source) {
            const isSourceExist = client.rainlink.searchEngines.get(source);
            if (isSourceExist)
                validSource = source;
        }
        const user = yield client.users.fetch(requester).catch(() => undefined);
        if (!query) {
            res.code(400);
            res.send({ error: "Search param not found" });
            return;
        }
        const result = yield client.rainlink
            .search(query, { requester: user, engine: source })
            .catch(() => ({
            playlistName: "dreamvast@error@noNode",
            tracks: [],
            type: RainlinkSearchResultType.SEARCH,
        }));
        if (result.tracks.length == 0 && result.playlistName == "dreamvast@error@noNode") {
            res.code(404);
            res.send({ error: "No node avaliable!" });
            return;
        }
        res.send({
            type: result.type,
            playlistName: (_a = result.playlistName) !== null && _a !== void 0 ? _a : null,
            tracks: result.tracks.map((track) => {
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
