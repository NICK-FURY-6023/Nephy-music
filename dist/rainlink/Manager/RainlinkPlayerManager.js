var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RainlinkEvents, RainlinkPlayerState, VoiceState } from "../Interface/Constants.js";
import { RainlinkPlayer } from "../Player/RainlinkPlayer.js";
import { RainlinkDatabase } from "../Utilities/RainlinkDatabase.js";
export class RainlinkPlayerManager extends RainlinkDatabase {
    /**
     * The main class for handling lavalink players
     * @param manager The rainlink manager
     */
    constructor(manager) {
        super();
        this.manager = manager;
    }
    /**
     * Create a player
     * @returns RainlinkPlayer
     * @internal
     */
    create(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.get(options.guildId))
                throw new Error("This guild already have an existing player");
            const getCustomNode = this.manager.nodes.get(String(options.nodeName ? options.nodeName : ""));
            const node = getCustomNode ? getCustomNode : yield this.manager.nodes.getLeastUsed();
            if (!node)
                throw new Error("Can't find any nodes to connect on");
            const customPlayer = this.manager.rainlinkOptions.options.structures && this.manager.rainlinkOptions.options.structures.player;
            let player = customPlayer
                ? new customPlayer(this.manager, options, node)
                : new RainlinkPlayer(this.manager, options, node);
            this.set(player.guildId, player);
            try {
                player = yield player.connect();
            }
            catch (err) {
                this.delete(player.guildId);
                throw err;
            }
            const onUpdate = (state) => {
                if (state !== VoiceState.SESSION_READY)
                    return;
                player.sendServerUpdate();
            };
            yield player.sendServerUpdate();
            player.on("connectionUpdate", onUpdate);
            player.state = RainlinkPlayerState.CONNECTED;
            this.debug("Player created at " + options.guildId);
            this.manager.emit(RainlinkEvents.PlayerCreate, player);
            const voiceReceiver = this.manager.plugins.get("rainlink-voiceReceiver");
            if (voiceReceiver && node.driver.id.includes("nodelink"))
                voiceReceiver.open(node, options);
            return player;
        });
    }
    /**
     * Destroy a player
     * @returns The destroyed / disconnected player or undefined if none
     * @internal
     */
    destroy() {
        return __awaiter(this, arguments, void 0, function* (guildId = "") {
            const player = this.get(guildId);
            if (player)
                yield player.destroy();
        });
    }
    debug(logs) {
        this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [PlayerManager] | ${logs}`);
    }
}
