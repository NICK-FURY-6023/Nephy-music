import { AbstractLibrary } from "./AbstractLibrary.js";
export class OceanicJS extends AbstractLibrary {
    // sendPacket is where your library send packets to Discord Gateway
    sendPacket(shardId, payload, important) {
        var _a;
        return (_a = this.client.shards.get(shardId)) === null || _a === void 0 ? void 0 : _a.send(payload.op, payload.d, important);
    }
    // getId is a getter where the lib stores the client user (the one logged in as a bot) id
    getId() {
        return this.client.user.id;
    }
    // getShardCount is for dealing ws with lavalink server
    getShardCount() {
        return this.client.shards && this.client.shards.size ? this.client.shards.size : 1;
    }
    // Listen attaches the event listener to the library you are using
    listen(nodes) {
        // Only attach to ready event once, refer to your library for its ready event
        this.client.once("ready", () => this.ready(nodes));
        // Attach to the raw websocket event, this event must be 1:1 on spec with dapi (most libs implement this)
        this.client.on("packet", (packet) => this.raw(packet));
    }
}
