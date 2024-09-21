// Modded from: https://github.com/shipgirlproject/Shoukaku/blob/396aa531096eda327ade0f473f9807576e9ae9df/src/connectors/libs/DiscordJS.ts
// Special thanks to shipgirlproject team!
import { AbstractLibrary } from "./AbstractLibrary.js";
export class DiscordJS extends AbstractLibrary {
    // sendPacket is where your library send packets to Discord Gateway
    sendPacket(shardId, payload, important) {
        var _a;
        return (_a = this.client.ws.shards.get(shardId)) === null || _a === void 0 ? void 0 : _a.send(payload, important);
    }
    // getId is a getter where the lib stores the client user (the one logged in as a bot) id
    getId() {
        return this.client.user.id;
    }
    // getShardCount is for dealing ws with lavalink server
    getShardCount() {
        return this.client.shard && this.client.shard.count ? this.client.shard.count : 1;
    }
    // Listen attaches the event listener to the library you are using
    listen(nodes) {
        this.client.once("ready", () => this.ready(nodes));
        this.client.on("raw", (packet) => this.raw(packet));
    }
}
