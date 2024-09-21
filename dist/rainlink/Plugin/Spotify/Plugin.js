var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RainlinkPluginType } from "../../Interface/Constants.js";
import { RainlinkSearchResultType, } from "../../Interface/Manager.js";
import { RainlinkTrack } from "../../Player/RainlinkTrack.js";
import { SourceRainlinkPlugin } from "../SourceRainlinkPlugin.js";
import { RequestManager } from "./RequestManager.js";
const REGEX = /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|album|artist)[\/:]([A-Za-z0-9]+)/;
const SHORT_REGEX = /(?:https:\/\/spotify\.link)\/([A-Za-z0-9]+)/;
export class RainlinkPlugin extends SourceRainlinkPlugin {
    /**
     * Initialize the plugin.
     * @param spotifyOptions Options for run plugin
     */
    constructor(spotifyOptions) {
        super();
        this.options = spotifyOptions;
        this.requestManager = new RequestManager(spotifyOptions);
        this.methods = {
            track: this.getTrack.bind(this),
            album: this.getAlbum.bind(this),
            artist: this.getArtist.bind(this),
            playlist: this.getPlaylist.bind(this),
        };
        this.rainlink = null;
        this._search = null;
    }
    /**
     * Source identify of the plugin
     * @returns string
     */
    sourceIdentify() {
        return "sp";
    }
    /**
     * Source name of the plugin
     * @returns string
     */
    sourceName() {
        return "spotify";
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
        return "rainlink-spotify";
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
                throw new Error("rainlink-spotify is not loaded yet.");
            if (!query)
                throw new Error("Query is required");
            const isUrl = /^https?:\/\//.test(query);
            if (SHORT_REGEX.test(query)) {
                const res = yield fetch(query, { method: "HEAD" });
                query = String(res.headers.get("location"));
            }
            const [, type, id] = REGEX.exec(query) || [];
            if (type in this.methods) {
                try {
                    const _function = this.methods[type];
                    const result = yield _function(id, options === null || options === void 0 ? void 0 : options.requester);
                    const loadType = type === "track" ? RainlinkSearchResultType.TRACK : RainlinkSearchResultType.PLAYLIST;
                    const playlistName = (_a = result.name) !== null && _a !== void 0 ? _a : undefined;
                    const tracks = result.tracks.filter(this.filterNullOrUndefined);
                    return this.buildSearch(playlistName, tracks, loadType);
                }
                catch (e) {
                    return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
                }
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
            var _a;
            const limit = this.options.searchLimit && this.options.searchLimit > 0 && this.options.searchLimit < 50
                ? this.options.searchLimit
                : 10;
            const tracks = yield this.requestManager.makeRequest(`/search?q=${decodeURIComponent(query)}&type=track&limit=${limit}&market=${(_a = this.options.searchMarket) !== null && _a !== void 0 ? _a : "US"}`);
            return {
                tracks: tracks.tracks.items.map((track) => this.buildrainlinkTrack(track, requester)),
            };
        });
    }
    getTrack(id, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            const track = yield this.requestManager.makeRequest(`/tracks/${id}`);
            return { tracks: [this.buildrainlinkTrack(track, requester)] };
        });
    }
    getAlbum(id, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const album = yield this.requestManager.makeRequest(`/albums/${id}?market=${(_a = this.options.searchMarket) !== null && _a !== void 0 ? _a : "US"}`);
            const tracks = album.tracks.items
                .filter(this.filterNullOrUndefined)
                .map((track) => { var _a; return this.buildrainlinkTrack(track, requester, (_a = album.images[0]) === null || _a === void 0 ? void 0 : _a.url); });
            if (album && tracks.length) {
                let next = album.tracks.next;
                let page = 1;
                while (next &&
                    (!this.options.playlistPageLimit ? true : ((_b = page < this.options.playlistPageLimit) !== null && _b !== void 0 ? _b : 1))) {
                    const nextTracks = yield this.requestManager.makeRequest(next !== null && next !== void 0 ? next : "", true);
                    page++;
                    if (nextTracks.items.length) {
                        next = nextTracks.next;
                        tracks.push(...nextTracks.items
                            .filter(this.filterNullOrUndefined)
                            .filter((a) => a.track)
                            .map((track) => { var _a; return this.buildrainlinkTrack(track.track, requester, (_a = album.images[0]) === null || _a === void 0 ? void 0 : _a.url); }));
                    }
                }
            }
            return { tracks, name: album.name };
        });
    }
    getArtist(id, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const artist = yield this.requestManager.makeRequest(`/artists/${id}`);
            const fetchedTracks = yield this.requestManager.makeRequest(`/artists/${id}/top-tracks?market=${(_a = this.options.searchMarket) !== null && _a !== void 0 ? _a : "US"}`);
            const tracks = fetchedTracks.tracks
                .filter(this.filterNullOrUndefined)
                .map((track) => { var _a; return this.buildrainlinkTrack(track, requester, (_a = artist.images[0]) === null || _a === void 0 ? void 0 : _a.url); });
            return { tracks, name: artist.name };
        });
    }
    getPlaylist(id, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const playlist = yield this.requestManager.makeRequest(`/playlists/${id}?market=${(_a = this.options.searchMarket) !== null && _a !== void 0 ? _a : "US"}`);
            const tracks = playlist.tracks.items
                .filter(this.filterNullOrUndefined)
                .map((track) => { var _a; return this.buildrainlinkTrack(track.track, requester, (_a = playlist.images[0]) === null || _a === void 0 ? void 0 : _a.url); });
            if (playlist && tracks.length) {
                let next = playlist.tracks.next;
                let page = 1;
                while (next &&
                    (!this.options.playlistPageLimit ? true : ((_b = page < this.options.playlistPageLimit) !== null && _b !== void 0 ? _b : 1))) {
                    const nextTracks = yield this.requestManager.makeRequest(next !== null && next !== void 0 ? next : "", true);
                    page++;
                    if (nextTracks.items.length) {
                        next = nextTracks.next;
                        tracks.push(...nextTracks.items
                            .filter(this.filterNullOrUndefined)
                            .filter((a) => a.track)
                            .map((track) => { var _a; return this.buildrainlinkTrack(track.track, requester, (_a = playlist.images[0]) === null || _a === void 0 ? void 0 : _a.url); }));
                    }
                }
            }
            return { tracks, name: playlist.name };
        });
    }
    filterNullOrUndefined(obj) {
        return obj !== undefined && obj !== null;
    }
    buildrainlinkTrack(spotifyTrack, requester, thumbnail) {
        var _a, _b;
        return new RainlinkTrack({
            encoded: "",
            info: {
                sourceName: "spotify",
                identifier: spotifyTrack.id,
                isSeekable: true,
                author: spotifyTrack.artists[0] ? spotifyTrack.artists[0].name : "Unknown",
                length: spotifyTrack.duration_ms,
                isStream: false,
                position: 0,
                title: spotifyTrack.name,
                uri: `https://open.spotify.com/track/${spotifyTrack.id}`,
                artworkUrl: thumbnail ? thumbnail : (_b = (_a = spotifyTrack.album) === null || _a === void 0 ? void 0 : _a.images[0]) === null || _b === void 0 ? void 0 : _b.url,
            },
            pluginInfo: {
                name: this.name(),
            },
        }, requester);
    }
}
