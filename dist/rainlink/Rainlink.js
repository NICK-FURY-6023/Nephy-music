var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RainlinkSearchResultType, } from "./Interface/Manager.js";
import { EventEmitter } from "node:events";
import { RainlinkPlayerManager } from "./Manager/RainlinkPlayerManager.js";
import { RainlinkNodeManager } from "./Manager/RainlinkNodeManager.js";
import { LavalinkLoadType, RainlinkEvents, RainlinkPluginType, SourceIDs, } from "./Interface/Constants.js";
import { RainlinkTrack } from "./Player/RainlinkTrack.js";
import { metadata } from "./metadata.js";
import { Lavalink3 } from "./Drivers/Lavalink3.js";
import { Nodelink2 } from "./Drivers/Nodelink2.js";
import { Lavalink4 } from "./Drivers/Lavalink4.js";
import { RainlinkDatabase } from "./Utilities/RainlinkDatabase.js";
export class Rainlink extends EventEmitter {
    /**
     * The main class that handle all works in lavalink server.
     * Call this class by using new Rainlink(your_params) to use!
     * @param options The main ranlink options
     */
    constructor(options) {
        var _a, _b;
        super();
        /**
         * The current bott's shard count
         */
        this.shardCount = 1;
        if (!options.library)
            throw new Error("Please set an new lib to connect, example: \nlibrary: new Library.DiscordJS(client) ");
        this.library = options.library.set(this);
        this.drivers = [new Lavalink3(), new Nodelink2(), new Lavalink4()];
        this.rainlinkOptions = options;
        this.rainlinkOptions.options = this.mergeDefault(this.defaultOptions, (_a = this.rainlinkOptions.options) !== null && _a !== void 0 ? _a : {});
        if (this.rainlinkOptions.options.additionalDriver &&
            ((_b = this.rainlinkOptions.options.additionalDriver) === null || _b === void 0 ? void 0 : _b.length) !== 0)
            this.drivers.push(...this.rainlinkOptions.options.additionalDriver);
        this.nodes = new RainlinkNodeManager(this);
        this.players = new RainlinkPlayerManager(this);
        this.searchEngines = new RainlinkDatabase();
        this.searchPlugins = new RainlinkDatabase();
        this.plugins = new RainlinkDatabase();
        this.initialSearchEngines();
        if (!this.rainlinkOptions.options.defaultSearchEngine ||
            this.rainlinkOptions.options.defaultSearchEngine.length == 0)
            this.rainlinkOptions.options.defaultSearchEngine == "youtube";
        if (this.rainlinkOptions.plugins) {
            for (const [, plugin] of this.rainlinkOptions.plugins.entries()) {
                if (plugin.constructor.name !== "RainlinkPlugin")
                    throw new Error("Plugin must be an instance of RainlinkPlugin or SourceRainlinkPlugin");
                plugin.load(this);
                this.plugins.set(plugin.name(), plugin);
                if (plugin.type() == RainlinkPluginType.SourceResolver) {
                    const newPlugin = plugin;
                    const sourceName = newPlugin.sourceName();
                    const sourceIdentify = newPlugin.sourceIdentify();
                    this.searchEngines.set(sourceName, sourceIdentify);
                    this.searchPlugins.set(sourceName, newPlugin);
                }
            }
        }
        this.library.listen(this.rainlinkOptions.nodes);
    }
    initialSearchEngines() {
        for (const data of SourceIDs) {
            this.searchEngines.set(data.name, data.id);
        }
    }
    /**
     * Create a new player.
     * @returns RainlinkNode
     */
    create(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.players.create(options);
        });
    }
    /**
     * Destroy a specific player.
     * @returns void
     */
    destroy(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.players.destroy(guildId);
        });
    }
    /**
     * Search a specific track.
     * @returns RainlinkSearchResult
     */
    search(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const node = options && (options === null || options === void 0 ? void 0 : options.nodeName)
                ? ((_a = this.nodes.get(options.nodeName)) !== null && _a !== void 0 ? _a : (yield this.nodes.getLeastUsed()))
                : yield this.nodes.getLeastUsed();
            if (!node)
                throw new Error("No node is available");
            let pluginData;
            const directSearchRegex = /directSearch=(.*)/;
            const isDirectSearch = directSearchRegex.exec(query);
            const isUrl = /^https?:\/\/.*/.test(query);
            const pluginSearch = this.searchPlugins.get(String(options === null || options === void 0 ? void 0 : options.engine));
            if (options &&
                options.engine &&
                options.engine !== null &&
                pluginSearch &&
                isDirectSearch == null) {
                pluginData = yield pluginSearch.searchDirect(query, options);
                if (pluginData.tracks.length !== 0)
                    return pluginData;
            }
            const source = options && (options === null || options === void 0 ? void 0 : options.engine)
                ? this.searchEngines.get(options.engine)
                : this.searchEngines.get(this.rainlinkOptions.options.defaultSearchEngine
                    ? this.rainlinkOptions.options.defaultSearchEngine
                    : "youtube");
            const finalQuery = isDirectSearch !== null ? isDirectSearch[1] : !isUrl ? `${source}search:${query}` : query;
            const result = yield node.rest.resolver(finalQuery).catch(() => null);
            if (!result || result.loadType === LavalinkLoadType.EMPTY) {
                return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
            }
            let loadType;
            let normalizedData = { tracks: [] };
            switch (result.loadType) {
                case LavalinkLoadType.TRACK: {
                    loadType = RainlinkSearchResultType.TRACK;
                    normalizedData.tracks = [result.data];
                    break;
                }
                case LavalinkLoadType.PLAYLIST: {
                    loadType = RainlinkSearchResultType.PLAYLIST;
                    normalizedData = {
                        playlistName: result.data.info.name,
                        tracks: result.data.tracks,
                    };
                    break;
                }
                case LavalinkLoadType.SEARCH: {
                    loadType = RainlinkSearchResultType.SEARCH;
                    normalizedData.tracks = result.data;
                    break;
                }
                default: {
                    loadType = RainlinkSearchResultType.SEARCH;
                    normalizedData.tracks = [];
                    break;
                }
            }
            this.emit(RainlinkEvents.Debug, `[Rainlink] / [Search] | Searched ${query}; Track results: ${normalizedData.tracks.length}`);
            return this.buildSearch((_b = normalizedData.playlistName) !== null && _b !== void 0 ? _b : undefined, normalizedData.tracks.map((track) => new RainlinkTrack(track, options && options.requester ? options.requester : undefined)), loadType);
        });
    }
    buildSearch(playlistName, tracks = [], type) {
        return {
            playlistName,
            tracks,
            type: type !== null && type !== void 0 ? type : RainlinkSearchResultType.SEARCH,
        };
    }
    get defaultOptions() {
        return {
            additionalDriver: [],
            retryTimeout: 3000,
            retryCount: 15,
            voiceConnectionTimeout: 15000,
            defaultSearchEngine: "soundcloud",
            defaultVolume: 100,
            searchFallback: {
                enable: true,
                engine: "soundcloud",
            },
            resume: false,
            userAgent: `Discord/Bot/${metadata.name}/${metadata.version} (${metadata.github})`,
            nodeResolver: undefined,
            structures: undefined,
            resumeTimeout: 300,
        };
    }
    // Modded from:
    // https://github.com/shipgirlproject/Shoukaku/blob/2677ecdf123ffef1c254c2113c5342b250ac4396/src/Utils.ts#L9-L23
    mergeDefault(def, given) {
        if (!given)
            return def;
        const defaultKeys = Object.keys(def);
        for (const key in given) {
            if (defaultKeys.includes(key))
                continue;
            if (this.isNumber(key))
                continue;
            delete given[key];
        }
        for (const key of defaultKeys) {
            if (Array.isArray(given[key]) && given[key] !== null && given[key] !== undefined) {
                if (given[key].length == 0)
                    given[key] = def[key];
            }
            if (def[key] === null || (typeof def[key] === "string" && def[key].length === 0)) {
                if (!given[key])
                    given[key] = def[key];
            }
            if (given[key] === null || given[key] === undefined)
                given[key] = def[key];
            if (typeof given[key] === "object" && given[key] !== null) {
                this.mergeDefault(def[key], given[key]);
            }
        }
        return given;
    }
    isNumber(data) {
        return /^[+-]?\d+(\.\d+)?$/.test(data);
    }
}
