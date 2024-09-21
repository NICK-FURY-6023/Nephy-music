var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RainlinkPluginType } from "../../main.js";
import { RainlinkSearchResultType } from "../../main.js";
import { RainlinkPlugin as Plugin } from "../../main.js";
const YOUTUBE_REGEX = [
    /^https?:\/\//,
    /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/,
    /^.*(youtu.be\/|list=)([^#\&\?]*).*/,
];
export class RainlinkPlugin extends Plugin {
    constructor(options) {
        super();
        this.options = options !== null && options !== void 0 ? options : { sources: ["scsearch"] };
        if (!this.options.sources || this.options.sources.length == 0)
            this.options.sources = ["scsearch"];
    }
    /** Name function for getting plugin name */
    name() {
        return "rainlink-youtubeConvert";
    }
    /** Type function for diferent type of plugin */
    type() {
        return RainlinkPluginType.Default;
    }
    /** Load function for make the plugin working */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    load(manager) {
        this._search = manager.search.bind(manager);
        manager.search = this.search.bind(this);
    }
    /** unload function for make the plugin stop working */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unload(manager) {
        if (!this._search)
            return;
        manager.search = this._search.bind(manager);
        this._search = undefined;
    }
    search(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if search func avaliable
            if (!this._search)
                return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
            // Check if that's a yt link
            const match = YOUTUBE_REGEX.some((match) => {
                return match.test(query) == true;
            });
            if (!match)
                return yield this._search(query, options);
            // Get search query
            const preRes = yield this._search(query, options);
            if (preRes.tracks.length == 0)
                return preRes;
            // Remove track encoded to trick rainlink
            if (preRes.type == RainlinkSearchResultType.PLAYLIST) {
                for (const track of preRes.tracks) {
                    track.encoded = "";
                }
                return preRes;
            }
            const song = preRes.tracks[0];
            const searchQuery = [song.author, song.title].filter((x) => !!x).join(" - ");
            const res = yield this.searchEngine(searchQuery, options);
            if (res.tracks.length !== 0)
                return res;
            return preRes;
        });
    }
    searchEngine(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._search)
                return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
            for (const SearchParams of this.options.sources) {
                const res = yield this._search(`directSearch=${SearchParams}:${query}`, options);
                if (res.tracks.length !== 0)
                    return res;
            }
            return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
        });
    }
    buildSearch(playlistName, tracks = [], type) {
        return {
            playlistName,
            tracks,
            type: type !== null && type !== void 0 ? type : RainlinkSearchResultType.SEARCH,
        };
    }
}
