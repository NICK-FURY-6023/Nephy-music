var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RainlinkPlugin } from "./RainlinkPlugin.js";
/** The interface class for track resolver plugin, extend it to use */
export class SourceRainlinkPlugin extends RainlinkPlugin {
    /**
     * sourceName function for source plugin register search engine.
     * This will make plugin avalible to search when set the source to default source
     * @returns string
     */
    sourceName() {
        throw new Error("Source plugin must implement sourceName() and return as string");
    }
    /**
     * sourceIdentify function for source plugin register search engine.
     * This will make plugin avalible to search when set the source to default source
     * @returns string
     */
    sourceIdentify() {
        throw new Error("Source plugin must implement sourceIdentify() and return as string");
    }
    /**
     * directSearchChecker function for checking if query have direct search param.
     * @returns boolean
     */
    directSearchChecker(query) {
        const directSearchRegex = /directSearch=(.*)/;
        const isDirectSearch = directSearchRegex.exec(query);
        return isDirectSearch == null;
    }
    /**
     * searchDirect function for source plugin search directly without fallback.
     * This will avoid overlaps in search function
     * @returns RainlinkSearchResult
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    searchDirect(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Source plugin must implement sourceIdentify() and return as string");
        });
    }
}
