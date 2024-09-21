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
export class PostCreatePlayer {
    constructor(client) {
        this.client = client;
        this.guild = null;
        this.member = null;
    }
    main(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            this.client.logger.info(PostCreatePlayer.name, `${req.method} ${req.routeOptions.url} payload=${req.body ? util.inspect(req.body) : "{}"}`);
            const data = req.body;
            const validBody = yield this.checker(data, req, res);
            if (!validBody)
                return;
            const playerData = {
                guildId: this.guild.id,
                voiceId: this.member.voice.channel.id,
                textId: "",
                shardId: (_b = (_a = this.guild) === null || _a === void 0 ? void 0 : _a.shardId) !== null && _b !== void 0 ? _b : 0,
                deaf: true,
                volume: this.client.config.player.DEFAULT_VOLUME,
            };
            this.client.rainlink.create(playerData);
            res.send(playerData);
        });
    }
    clean() {
        this.guild = null;
        this.member = null;
    }
    checker(data, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqKey = ["guildId", "userId"];
            if (!data)
                return this.errorRes(req, res, "Missing body");
            if (Object.keys(data).length !== reqKey.length)
                return this.errorRes(req, res, "Missing key");
            if (!data["guildId"])
                return this.errorRes(req, res, "Missing guildId key");
            if (!data["userId"])
                return this.errorRes(req, res, "Missing userId key");
            const Guild = yield this.client.guilds.fetch(data["guildId"]).catch(() => undefined);
            if (!Guild)
                return this.errorRes(req, res, "Guild not found");
            const isPlayerExist = this.client.rainlink.players.get(Guild.id);
            if (isPlayerExist)
                return this.errorRes(req, res, "Player existed in this guild");
            this.guild = Guild;
            const Member = yield Guild.members.fetch(data["userId"]).catch(() => undefined);
            if (!Member)
                return this.errorRes(req, res, "User not found");
            if (!Member.voice.channel || !Member.voice)
                return this.errorRes(req, res, "User is not in voice");
            this.member = Member;
            return true;
        });
    }
    errorRes(req, res, message) {
        return __awaiter(this, void 0, void 0, function* () {
            res.code(400);
            res.send({ error: message });
            this.clean();
            return false;
        });
    }
}
