import { RainlinkEvents, RainlinkPluginType } from "../../Interface/Constants.js";
import { RainlinkPlugin as Plugin } from "./../RainlinkPlugin.js";
export class RainlinkPlugin extends Plugin {
    /**
     * Initialize the plugin.
     * @param client Discord.Client
     */
    constructor(client) {
        super();
        this.client = client;
        this.rainlink = null;
    }
    /**
     * Type of the plugin
     * @returns RainlinkPluginType
     */
    type() {
        return RainlinkPluginType.Default;
    }
    /**
     * Load the plugin.
     * @param rainlink rainlink
     */
    load(rainlink) {
        this.rainlink = rainlink;
        this.client.on("voiceStateUpdate", this.onVoiceStateUpdate.bind(this));
    }
    /**
     * The name of the plugin
     * @returns string
     */
    name() {
        return "rainlink-playerMoved";
    }
    /**
     * Unload the plugin.
     */
    unload() {
        this.client.removeListener("voiceStateUpdate", this.onVoiceStateUpdate.bind(this));
        this.rainlink = null;
    }
    onVoiceStateUpdate(oldState, newState) {
        if (!this.rainlink || oldState.id !== this.client.user.id)
            return;
        const newChannelId = newState.channelID || newState.channelId;
        const oldChannelId = oldState.channelID || oldState.channelId;
        const guildId = newState.guild.id;
        const player = this.rainlink.players.get(guildId);
        if (!player)
            return;
        let state = "UNKNOWN";
        if (!oldChannelId && newChannelId)
            state = "JOINED";
        else if (oldChannelId && !newChannelId)
            state = "LEFT";
        else if (oldChannelId && newChannelId && oldChannelId !== newChannelId)
            state = "MOVED";
        if (state === "UNKNOWN")
            return;
        this.rainlink.emit(RainlinkEvents.PlayerMoved, player, state, {
            oldChannelId,
            newChannelId,
        });
    }
}
