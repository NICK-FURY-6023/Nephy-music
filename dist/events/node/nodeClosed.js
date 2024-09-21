var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AutoFixLavalink } from "../../autofix/AutoFixLavalink.js";
export default class {
    execute(client, node) {
        return __awaiter(this, void 0, void 0, function* () {
            client.logger.debug(import.meta.url, `Lavalink ${node.options.name}: Closed`);
            if (client.config.features.AUTOFIX_LAVALINK.enable) {
                new AutoFixLavalink(client, node.options.name);
            }
        });
    }
}
