var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RainlinkConnectState, RainlinkEvents } from "../Interface/Constants.js";
import { RainlinkNode } from "../Node/RainlinkNode.js";
import { RainlinkDatabase } from "../Utilities/RainlinkDatabase.js";
export class RainlinkNodeManager extends RainlinkDatabase {
    /**
     * The main class for handling lavalink servers
     * @param manager
     */
    constructor(manager) {
        super();
        this.manager = manager;
    }
    /**
     * Add a new Node.
     * @returns RainlinkNode
     */
    add(node) {
        const newNode = new RainlinkNode(this.manager, node);
        newNode.connect();
        this.set(node.name, newNode);
        this.debug(`Node ${node.name} added to manager!`);
        return newNode;
    }
    /**
     * Get a least used node.
     * @returns RainlinkNode
     */
    getLeastUsed() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.manager.rainlinkOptions.options.nodeResolver) {
                const resolverData = yield this.manager.rainlinkOptions.options.nodeResolver(this);
                if (resolverData)
                    return resolverData;
            }
            const nodes = this.values;
            const onlineNodes = nodes.filter((node) => node.state === RainlinkConnectState.Connected);
            if (!onlineNodes.length)
                throw new Error("No nodes are online");
            const temp = yield Promise.all(onlineNodes.map((node) => __awaiter(this, void 0, void 0, function* () {
                const stats = yield node.rest.getStatus();
                return !stats ? { players: 0, node: node } : { players: stats.players, node: node };
            })));
            temp.sort((a, b) => a.players - b.players);
            return temp[0].node;
        });
    }
    /**
     * Get all current nodes
     * @returns RainlinkNode[]
     */
    all() {
        return this.values;
    }
    /**
     * Remove a node.
     * @returns void
     */
    remove(name) {
        const node = this.get(name);
        if (node) {
            node.disconnect();
            this.delete(name);
            this.debug(`Node ${name} removed from manager!`);
        }
        return;
    }
    debug(logs) {
        this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [NodeManager] | ${logs}`);
    }
}
