// Get from: https://github.com/shipgirlproject/Shoukaku/blob/396aa531096eda327ade0f473f9807576e9ae9df/src/connectors/Connector.ts
// Special thanks to shipgirlproject team!
export const AllowedPackets = ["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"];
export class AbstractLibrary {
    constructor(client) {
        this.client = client;
        this.manager = null;
    }
    ready(nodes) {
        var _a;
        this.manager.id = this.getId();
        this.manager.shardCount = this.getShardCount();
        this.manager.emit("debug", `[Rainlink] | Finished the initialization process | Registered ${this.manager.plugins.size} plugins | Now connect all current nodes`);
        for (const node of nodes)
            (_a = this.manager) === null || _a === void 0 ? void 0 : _a.nodes.add(node);
    }
    set(manager) {
        this.manager = manager;
        return this;
    }
    raw(packet) {
        if (!AllowedPackets.includes(packet.t))
            return;
        const guildId = packet.d.guild_id;
        const players = this.manager.players.get(guildId);
        if (!players)
            return;
        if (packet.t === "VOICE_SERVER_UPDATE")
            return players.setServerUpdate(packet.d);
        const userId = packet.d.user_id;
        if (userId !== this.manager.id)
            return;
        players.setStateUpdate(packet.d);
    }
}
