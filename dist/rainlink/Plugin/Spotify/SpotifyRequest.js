var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const BASE_URL = "https://api.spotify.com/v1";
export class SpotifyRequest {
    constructor(client) {
        this.client = client;
        this.token = "";
        this.authorization = "";
        this.nextRenew = 0;
        this.stats = {
            requests: 0,
            rateLimited: false,
        };
        this.authorization = `&client_id=${this.client.clientId}&client_secret=${this.client.clientSecret}`;
    }
    makeRequest(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, disableBaseUri = false) {
            yield this.renew();
            const request = yield fetch(disableBaseUri ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`, {
                headers: { Authorization: this.token },
            });
            const data = (yield request.json());
            if (request.headers.get("x-ratelimit-remaining") === "0") {
                this.handleRateLimited(Number(request.headers.get("x-ratelimit-reset")) * 1000);
                throw new Error("Rate limited by spotify");
            }
            this.stats.requests++;
            return data;
        });
    }
    handleRateLimited(time) {
        this.stats.rateLimited = true;
        setTimeout(() => {
            this.stats.rateLimited = false;
        }, time);
    }
    renewToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`https://accounts.spotify.com/api/token?grant_type=client_credentials${this.authorization}`, {
                method: "POST",
                headers: {
                    // Authorization: this.authorization,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            const { access_token, expires_in } = (yield res.json());
            if (!access_token)
                throw new Error("Failed to get access token due to invalid spotify client");
            this.token = `Bearer ${access_token}`;
            this.nextRenew = Date.now() + expires_in * 1000;
        });
    }
    renew() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Date.now() >= this.nextRenew) {
                yield this.renewToken();
            }
        });
    }
}
