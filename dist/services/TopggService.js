var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import cron from "node-cron";
import { request } from "undici";
export var TopggServiceEnum;
(function (TopggServiceEnum) {
    TopggServiceEnum[TopggServiceEnum["ERROR"] = 0] = "ERROR";
    TopggServiceEnum[TopggServiceEnum["VOTED"] = 1] = "VOTED";
    TopggServiceEnum[TopggServiceEnum["UNVOTED"] = 2] = "UNVOTED";
})(TopggServiceEnum || (TopggServiceEnum = {}));
export class TopggService {
    constructor(client) {
        this.client = client;
        this.isTokenAvalible = false;
        this.url = "https://top.gg/api";
    }
    settingUp(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.fetch(`/bots/${userId}/stats`);
            if (res.status == 200) {
                this.isTokenAvalible = true;
                this.botId = userId;
                this.client.logger.info(import.meta.url, "Topgg service has been successfully set up!");
                return true;
            }
            this.client.logger.error(import.meta.url, "There was a problem setting up the topgg service");
            this.client.logger.error(import.meta.url, yield res.text());
            return false;
        });
    }
    checkVote(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.botId || !this.isTokenAvalible) {
                this.client.logger.error(import.meta.url, "TopGG service not setting up! check vote will always return false");
                return TopggServiceEnum.ERROR;
            }
            const res = yield this.fetch(`/bots/${this.botId}/check?userId=${userId}`);
            if (res.status !== 200) {
                this.client.logger.error(import.meta.url, "There was a problem when fetching data from top.gg");
                return TopggServiceEnum.ERROR;
            }
            const jsonRes = (yield res.json());
            if (jsonRes.voted !== 0)
                return TopggServiceEnum.VOTED;
            return TopggServiceEnum.UNVOTED;
        });
    }
    fetch(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetch(this.url + path, {
                headers: {
                    Authorization: this.client.config.features.TOPGG_TOKEN,
                },
            });
        });
    }
    startInterval() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.botId || !this.isTokenAvalible)
                throw new Error("TopGG service not setting up!");
            this.updateServerCount(this.client.guilds.cache.size);
            cron.schedule("0 */1 * * * *", () => this.updateServerCount(this.client.guilds.cache.size));
            this.client.logger.info(import.meta.url, "Topgg server count update service has been successfully set up!");
        });
    }
    updateServerCount(count) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.botId || !this.isTokenAvalible)
                throw new Error("TopGG service not setting up!");
            yield request(this.url + `/bots/${this.botId}/stats`, {
                method: "POST",
                body: JSON.stringify({
                    server_count: count,
                }),
                headers: {
                    Authorization: this.client.config.features.TOPGG_TOKEN,
                    "Content-Type": "application/json",
                },
            });
        });
    }
}
