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
export class PatchControl {
    constructor(client) {
        this.client = client;
        this.skiped = false;
        this.isPrevious = false;
        this.addedTrack = [];
    }
    main(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.logger.info(PatchControl.name, `${req.method} ${req.routeOptions.url} payload=${req.body ? util.inspect(req.body) : "{}"}`);
            const isValid = yield this.checker(req, res);
            if (!isValid)
                return;
            const guildId = req.params["guildId"];
            const player = this.client.rainlink.players.get(guildId);
            const jsonBody = req.body;
            const currentKeys = Object.keys(jsonBody);
            for (const key of currentKeys) {
                const data = yield this[key](res, player, jsonBody[key]);
                if (!data)
                    return;
            }
            res.send({
                loop: jsonBody.loop,
                skiped: this.skiped,
                previous: this.isPrevious,
                position: jsonBody.position,
                volume: jsonBody.volume,
                added: this.addedTrack,
            });
            this.resetData();
        });
    }
    loop(res, player, mode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mode || !["song", "queue", "none"].includes(mode)) {
                res.code(400);
                res.send({ error: `Invalid loop mode, '${mode}' mode does not exist!` });
                return false;
            }
            player.setLoop(mode);
            return true;
        });
    }
    skipMode(res, player, mode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mode || !["previous", "skip"].includes(mode)) {
                res.code(400);
                res.send({ error: `Invalid loop mode, '${mode}' mode does not exist!` });
                return false;
            }
            if (player.queue.length == 0)
                return true;
            if (mode == "skip") {
                yield player.skip();
                this.skiped = true;
                return true;
            }
            yield player.previous();
            this.isPrevious = true;
            return true;
        });
    }
    position(res, player, pos) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isNaN(Number(pos))) {
                res.code(400);
                res.send({ error: `Position must be a number!` });
                return false;
            }
            yield player.seek(Number(pos));
            return true;
        });
    }
    volume(res, player, vol) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!vol)
                return true;
            if (isNaN(Number(vol))) {
                res.code(400);
                res.send({ error: `Volume must be a number!` });
                return false;
            }
            yield player.setVolume(Number(vol));
            return true;
        });
    }
    add(res, player, uriArray) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!uriArray)
                return true;
            for (const uri of uriArray) {
                if (!this.isValidHttpUrl(uri)) {
                    res.code(400);
                    res.send({ error: `add property must have a link!` });
                    return false;
                }
                const result = yield this.client.rainlink.search(uri);
                if (result.tracks.length == 0) {
                    res.code(400);
                    res.send({ error: `Track not found!` });
                    return false;
                }
                const song = result.tracks[0];
                player.queue.add(song);
                this.addedTrack.push({
                    title: song.title,
                    uri: song.uri || "",
                    length: song.duration,
                    thumbnail: song.artworkUrl || "",
                    author: song.author,
                    requester: null,
                });
            }
            return true;
        });
    }
    checker(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const accpetKey = ["loop", "skipMode", "position", "volume", "add"];
            const guildId = req.params["guildId"];
            const player = this.client.rainlink.players.get(guildId);
            if (!player) {
                res.code(404);
                res.send({ error: "Current player not found!" });
                return false;
            }
            if (req.headers["content-type"] !== "application/json") {
                res.code(400);
                res.send({ error: "content-type must be application/json!" });
                return false;
            }
            if (!req.body) {
                res.code(400);
                res.send({ error: "Missing body" });
                return false;
            }
            const jsonBody = req.body;
            for (const key of Object.keys(jsonBody)) {
                if (!accpetKey.includes(key)) {
                    res.code(400);
                    res.send({ error: `Invalid body, key '${key}' does not exist!` });
                    return false;
                }
            }
            return true;
        });
    }
    resetData() {
        this.skiped = false;
        this.addedTrack = [];
        this.isPrevious = false;
    }
    isValidHttpUrl(string) {
        let url;
        try {
            url = new URL(string);
        }
        catch (_) {
            return false;
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }
}
