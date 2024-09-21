var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RainlinkEvents, RainlinkPluginType } from "../../main.js";
import { RainlinkSearchResultType, } from "../../main.js";
import { RainlinkTrack } from "../../main.js";
import { SourceRainlinkPlugin } from "../../main.js";
import NicoResolver from "./NicoResolver.js";
import search from "./NicoSearch.js";
const REGEX = RegExp(
// https://github.com/ytdl-org/youtube-dl/blob/a8035827177d6b59aca03bd717acb6a9bdd75ada/youtube_dl/extractor/niconico.py#L162
"https?://(?:www\\.|secure\\.|sp\\.)?nicovideo\\.jp/watch/(?<id>(?:[a-z]{2})?[0-9]+)");
export class RainlinkPlugin extends SourceRainlinkPlugin {
    /**
     * Initialize the plugin.
     * @param nicoOptions Options for run plugin
     */
    constructor(nicoOptions) {
        super();
        this.options = nicoOptions;
        this.methods = {
            track: this.getTrack.bind(this),
        };
        this.rainlink = null;
    }
    /**
     * Source identify of the plugin
     * @returns string
     */
    sourceIdentify() {
        return "nv";
    }
    /**
     * Source name of the plugin
     * @returns string
     */
    sourceName() {
        return "nicovideo";
    }
    /**
     * Type of the plugin
     * @returns RainlinkPluginType
     */
    type() {
        return RainlinkPluginType.SourceResolver;
    }
    /**
     * load the plugin
     * @param rainlink The rainlink class
     */
    load(rainlink) {
        this.rainlink = rainlink;
        this._search = rainlink.search.bind(rainlink);
        rainlink.search = this.search.bind(this);
    }
    /**
     * Unload the plugin
     * @param rainlink The rainlink class
     */
    unload(rainlink) {
        this.rainlink = rainlink;
        rainlink.search = rainlink.search.bind(rainlink);
    }
    /** Name function for getting plugin name */
    name() {
        return "rainlink-nico";
    }
    search(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this._search(query, options);
            if (!this.directSearchChecker(query))
                return res;
            if (res.tracks.length == 0)
                return this.searchDirect(query, options);
            else
                return res;
        });
    }
    /**
     * Directly search from plugin
     * @param query URI or track name query
     * @param options search option like RainlinkSearchOptions
     * @returns RainlinkSearchResult
     */
    searchDirect(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.rainlink || !this._search)
                throw new Error("rainlink-nico is not loaded yet.");
            if (!query)
                throw new Error("Query is required");
            const [, id] = REGEX.exec(query) || [];
            const isUrl = /^https?:\/\//.test(query);
            if (id) {
                this.debug(`Start search from ${this.sourceName()} plugin`);
                const _function = this.methods.track;
                const result = yield _function(id, options === null || options === void 0 ? void 0 : options.requester);
                const loadType = result ? RainlinkSearchResultType.TRACK : RainlinkSearchResultType.SEARCH;
                const playlistName = (_a = result.name) !== null && _a !== void 0 ? _a : undefined;
                const tracks = result.tracks.filter(this.filterNullOrUndefined);
                return this.buildSearch(playlistName, tracks && tracks.length !== 0 ? tracks : [], loadType);
            }
            else if ((options === null || options === void 0 ? void 0 : options.engine) === this.sourceName() && !isUrl) {
                const result = yield this.searchTrack(query, options === null || options === void 0 ? void 0 : options.requester);
                return this.buildSearch(undefined, result.tracks, RainlinkSearchResultType.SEARCH);
            }
            else
                return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
        });
    }
    buildSearch(playlistName, tracks = [], type) {
        return {
            playlistName,
            tracks,
            type: type !== null && type !== void 0 ? type : RainlinkSearchResultType.TRACK,
        };
    }
    searchTrack(query, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield search({
                    q: query,
                    targets: ["tagsExact"],
                    fields: ["contentId"],
                    sort: "-viewCounter",
                    limit: 10,
                });
                const res = [];
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    const nico = new NicoResolver(`https://www.nicovideo.jp/watch/${element.contentId}`);
                    const info = yield nico.getVideoInfo();
                    res.push(info);
                }
                return {
                    tracks: res.map((track) => this.buildrainlinkTrack(track, requester)),
                };
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    getTrack(id, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const niconico = new NicoResolver(`https://www.nicovideo.jp/watch/${id}`);
                const info = yield niconico.getVideoInfo();
                return { tracks: [this.buildrainlinkTrack(info, requester)] };
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    filterNullOrUndefined(obj) {
        return obj !== undefined && obj !== null;
    }
    buildrainlinkTrack(nicoTrack, requester) {
        return new RainlinkTrack({
            encoded: "",
            info: {
                sourceName: this.sourceName(),
                identifier: nicoTrack.id,
                isSeekable: true,
                author: nicoTrack.owner ? nicoTrack.owner.nickname : "Unknown",
                length: nicoTrack.duration * 1000,
                isStream: false,
                position: 0,
                title: nicoTrack.title,
                uri: `https://www.nicovideo.jp/watch/${nicoTrack.id}`,
                artworkUrl: nicoTrack.thumbnail ? nicoTrack.thumbnail.url : "",
            },
            pluginInfo: {
                name: "rainlink.mod@nico",
            },
        }, requester);
    }
    debug(logs) {
        this.rainlink
            ? this.rainlink.emit(RainlinkEvents.Debug, `[Rainlink Nico Plugin]: ${logs}`)
            : true;
    }
}
