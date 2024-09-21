// Modded from: https://github.com/shipgirlproject/Shoukaku/blob/396aa531096eda327ade0f473f9807576e9ae9df/src/connectors/Connector.ts
// Special thanks to shipgirlproject team!
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { LavalinkLoadType } from "../Interface/Constants.js";
export class RainlinkRest {
    /**
     * The lavalink rest server handler class
     * @param manager The rainlink manager
     * @param options The rainlink node options, from RainlinkNodeOptions interface
     * @param nodeManager The rainlink's lavalink server handler class
     */
    constructor(manager, options, nodeManager) {
        this.manager = manager;
        this.options = options;
        this.nodeManager = nodeManager;
        this.sessionId = this.nodeManager.driver.sessionId ? this.nodeManager.driver.sessionId : "";
    }
    /**
     * Gets all the player with the specified sessionId
     * @returns Promise that resolves to an array of Lavalink players
     */
    getPlayers() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const options = {
                path: `/sessions/${this.sessionId}/players`,
                headers: { "content-type": "application/json" },
            };
            return (_a = (yield this.nodeManager.driver.requester(options))) !== null && _a !== void 0 ? _a : [];
        });
    }
    /**
     * Gets current lavalink status
     * @returns Promise that resolves to an object of current lavalink status
     */
    getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                path: "/stats",
                headers: { "content-type": "application/json" },
            };
            return yield this.nodeManager.driver.requester(options);
        });
    }
    /**
     * Decode a single track from "encoded" properties
     * @returns Promise that resolves to an object of raw track
     */
    decodeTrack(base64track) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                path: `/decodetrack?encodedTrack=${encodeURIComponent(base64track)}`,
                headers: { "content-type": "application/json" },
            };
            return yield this.nodeManager.driver.requester(options);
        });
    }
    /**
     * Updates a Lavalink player
     * @returns Promise that resolves to a Lavalink player
     */
    updatePlayer(data) {
        var _a;
        const options = {
            path: `/sessions/${this.sessionId}/players/${data.guildId}`,
            params: { noReplace: ((_a = data.noReplace) === null || _a === void 0 ? void 0 : _a.toString()) || "false" },
            headers: { "content-type": "application/json" },
            method: "PATCH",
            data: data.playerOptions,
            rawReqData: data,
        };
        this.nodeManager.driver.requester(options);
    }
    /**
     * Destroy a Lavalink player
     * @returns Promise that resolves to a Lavalink player
     */
    destroyPlayer(guildId) {
        const options = {
            path: `/sessions/${this.sessionId}/players/${guildId}`,
            headers: { "content-type": "application/json" },
            method: "DELETE",
        };
        this.nodeManager.driver.requester(options);
    }
    /**
     * A track resolver function to get track from lavalink
     * @returns LavalinkResponse
     */
    resolver(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                path: "/loadtracks",
                params: { identifier: data },
                headers: { "content-type": "application/json" },
                method: "GET",
            };
            const resData = yield this.nodeManager.driver.requester(options);
            if (!resData) {
                return {
                    loadType: LavalinkLoadType.EMPTY,
                    data: {},
                };
            }
            else
                return resData;
        });
    }
    /**
     * Get routeplanner status from Lavalink
     * @returns Promise that resolves to a routeplanner response
     */
    getRoutePlannerStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                path: "/routeplanner/status",
                headers: { "content-type": "application/json" },
            };
            return yield this.nodeManager.driver.requester(options);
        });
    }
    /**
     * Release blacklisted IP address into pool of IPs
     * @param address IP address
     */
    unmarkFailedAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                path: "/routeplanner/free/address",
                method: "POST",
                headers: { "content-type": "application/json" },
                data: { address },
            };
            yield this.nodeManager.driver.requester(options);
        });
    }
    /**
     * Get Lavalink info
     */
    getInfo() {
        const options = {
            path: "/info",
            headers: { "content-type": "application/json" },
        };
        return this.nodeManager.driver.requester(options);
    }
    testJSON(text) {
        if (typeof text !== "string") {
            return false;
        }
        try {
            JSON.parse(text);
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
