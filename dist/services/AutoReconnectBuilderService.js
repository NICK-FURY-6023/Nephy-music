var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class AutoReconnectBuilderService {
    constructor(client, player) {
        this.client = client;
        this.player = player;
    }
    execute(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.client.db.autoreconnect.get(guildId);
            if (check)
                return check;
            if (!this.player)
                return yield this.noPlayerBuild(guildId);
            return yield this.playerBuild(guildId);
        });
    }
    get(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.client.db.autoreconnect.get(guildId);
            if (check)
                return check;
            else
                null;
        });
    }
    noPlayerBuild(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.db.autoreconnect.set(`${guildId}`, {
                guild: guildId,
                text: "",
                voice: "",
                current: "",
                config: {
                    loop: "none",
                },
                queue: [],
                twentyfourseven: false,
            });
        });
    }
    playerBuild(guildId_1) {
        return __awaiter(this, arguments, void 0, function* (guildId, two47mode = false) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            return yield this.client.db.autoreconnect.set(`${guildId}`, {
                guild: (_a = this.player) === null || _a === void 0 ? void 0 : _a.guildId,
                text: (_b = this.player) === null || _b === void 0 ? void 0 : _b.textId,
                voice: (_c = this.player) === null || _c === void 0 ? void 0 : _c.voiceId,
                current: (_f = (_e = (_d = this.player) === null || _d === void 0 ? void 0 : _d.queue.current) === null || _e === void 0 ? void 0 : _e.uri) !== null && _f !== void 0 ? _f : "",
                config: {
                    loop: (_g = this.player) === null || _g === void 0 ? void 0 : _g.loop,
                },
                queue: ((_h = this.player) === null || _h === void 0 ? void 0 : _h.queue.length) !== 0 ? this.queueUri() : [],
                previous: ((_j = this.player) === null || _j === void 0 ? void 0 : _j.queue.previous.length) !== 0 ? this.previousUri() : [],
                twentyfourseven: two47mode,
            });
        });
    }
    build247(guildId_1) {
        return __awaiter(this, arguments, void 0, function* (guildId, mode = true, voiceId = "") {
            var _a, _b;
            return yield this.client.db.autoreconnect.set(`${guildId}`, {
                guild: (_a = this.player) === null || _a === void 0 ? void 0 : _a.guildId,
                text: (_b = this.player) === null || _b === void 0 ? void 0 : _b.textId,
                voice: voiceId,
                current: "",
                config: {
                    loop: "none",
                },
                queue: [],
                twentyfourseven: mode,
            });
        });
    }
    queueUri() {
        var _a;
        const res = [];
        for (let data of (_a = this.player) === null || _a === void 0 ? void 0 : _a.queue) {
            res.push(data.uri);
        }
        return res;
    }
    previousUri() {
        var _a;
        const res = [];
        for (let data of (_a = this.player) === null || _a === void 0 ? void 0 : _a.queue.previous) {
            res.push(data.uri);
        }
        return res;
    }
}
