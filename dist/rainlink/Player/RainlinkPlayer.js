var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RainlinkQueue } from "./RainlinkQueue.js";
import { RainlinkEvents, RainlinkFilterData, RainlinkLoopMode, RainlinkPlayerState, VoiceConnectState, VoiceState, } from "../Interface/Constants.js";
import { RainlinkTrack } from "./RainlinkTrack.js";
import { EventEmitter } from "node:events";
import { RainlinkDatabase } from "../Utilities/RainlinkDatabase.js";
import { RainlinkFilter } from "./RainlinkFilter.js";
export class RainlinkPlayer extends EventEmitter {
    /**
     * The rainlink player handler class
     * @param manager The rainlink manager
     * @param voiceOptions The rainlink voice option, use VoiceChannelOptions interface
     * @param node The rainlink current use node
     */
    constructor(manager, voiceOptions, node) {
        var _a, _b, _c, _d;
        super();
        this.manager = manager;
        this.guildId = voiceOptions.guildId;
        this.voiceId = voiceOptions.voiceId;
        this.shardId = voiceOptions.shardId;
        this.mute = (_a = voiceOptions.mute) !== null && _a !== void 0 ? _a : false;
        this.deaf = (_b = voiceOptions.deaf) !== null && _b !== void 0 ? _b : false;
        this.lastvoiceId = null;
        this.sessionId = null;
        this.region = null;
        this.lastRegion = null;
        this.serverUpdate = null;
        this.voiceState = VoiceConnectState.DISCONNECTED;
        this.node = node;
        this.guildId = voiceOptions.guildId;
        this.voiceId = voiceOptions.voiceId;
        this.textId = voiceOptions.textId;
        const customQueue = this.manager.rainlinkOptions.options.structures && this.manager.rainlinkOptions.options.structures.queue;
        this.queue = customQueue ? new customQueue(this.manager, this) : new RainlinkQueue(this.manager, this);
        this.filter = new RainlinkFilter(this);
        this.data = new RainlinkDatabase();
        this.paused = true;
        this.position = 0;
        this.volume = this.manager.rainlinkOptions.options.defaultVolume;
        this.playing = false;
        this.loop = RainlinkLoopMode.NONE;
        this.state = RainlinkPlayerState.DESTROYED;
        this.deaf = (_c = voiceOptions.deaf) !== null && _c !== void 0 ? _c : false;
        this.mute = (_d = voiceOptions.mute) !== null && _d !== void 0 ? _d : false;
        this.sudoDestroy = false;
        this.track = null;
        this.functions = new RainlinkDatabase();
        if (this.node.driver.playerFunctions.size !== 0) {
            this.node.driver.playerFunctions.forEach((data, index) => {
                this.functions.set(index, data.bind(null, this));
            });
        }
        if (voiceOptions.volume && voiceOptions.volume !== this.volume)
            this.volume = voiceOptions.volume;
    }
    /**
     * Sends server update to lavalink
     * @internal
     */
    sendServerUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            const playerUpdate = {
                guildId: this.guildId,
                playerOptions: {
                    voice: {
                        token: this.serverUpdate.token,
                        endpoint: this.serverUpdate.endpoint,
                        sessionId: this.sessionId,
                    },
                },
            };
            this.node.rest.updatePlayer(playerUpdate);
        });
    }
    /**
     * Destroy the player
     * @internal
     */
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            this.sudoDestroy = true;
            this.clear(false);
            this.disconnect();
            const voiceReceiver = this.manager.plugins.get("rainlink-voiceReceiver");
            if (voiceReceiver && this.node.driver.id.includes("nodelink"))
                voiceReceiver.close(this.guildId);
            this.node.rest.updatePlayer({
                guildId: this.guildId,
                playerOptions: {
                    track: {
                        encoded: null,
                        length: 0,
                    },
                },
            });
            this.node.rest.destroyPlayer(this.guildId);
            this.manager.players.delete(this.guildId);
            this.state = RainlinkPlayerState.DESTROYED;
            this.debug("Player destroyed at " + this.guildId);
            this.voiceId = "";
            this.manager.emit(RainlinkEvents.PlayerDestroy, this);
            this.sudoDestroy = false;
        });
    }
    /**
     * Play a track
     * @param track Track to play
     * @param options Play options
     * @returns RainlinkPlayer
     */
    play(track, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.checkDestroyed();
            if (track && !(track instanceof RainlinkTrack))
                throw new Error("track must be a RainlinkTrack");
            if (!track && !this.queue.totalSize)
                throw new Error("No track is available to play");
            if (!options || typeof options.replaceCurrent !== "boolean")
                options = Object.assign(Object.assign({}, options), { replaceCurrent: false });
            if (track) {
                if (!options.replaceCurrent && this.queue.current)
                    this.queue.unshift(this.queue.current);
                this.queue.current = track;
            }
            else if (!this.queue.current)
                this.queue.current = this.queue.shift();
            if (!this.queue.current)
                throw new Error("No track is available to play");
            const current = this.queue.current;
            let errorMessage;
            const resolveResult = yield current.resolver(this.manager, { nodeName: this.node.options.name }).catch((e) => {
                errorMessage = e.message;
                return null;
            });
            if (!resolveResult || (resolveResult && !resolveResult.isPlayable)) {
                this.manager.emit(RainlinkEvents.TrackResolveError, this, current, errorMessage);
                this.debug(`Player ${this.guildId} resolve error: ${errorMessage}`);
                this.queue.current = null;
                this.queue.size ? yield this.play() : this.manager.emit(RainlinkEvents.QueueEmpty, this);
                return this;
            }
            this.playing = true;
            this.track = current.encoded;
            const playerOptions = Object.assign(Object.assign({ track: {
                    encoded: current.encoded,
                    length: current.duration,
                } }, options), { volume: this.volume });
            if (playerOptions.paused) {
                this.paused = playerOptions.paused;
                this.playing = !this.paused;
            }
            if (playerOptions.position)
                this.position = playerOptions.position;
            this.node.rest.updatePlayer({
                guildId: this.guildId,
                noReplace: (_a = options === null || options === void 0 ? void 0 : options.noReplace) !== null && _a !== void 0 ? _a : false,
                playerOptions,
            });
            return this;
        });
    }
    /**
     * Set the loop mode of the track
     * @param mode Mode to loop
     * @returns RainlinkPlayer
     */
    setLoop(mode) {
        this.checkDestroyed();
        this.loop = mode;
        return this;
    }
    /**
     * Search track directly from player
     * @param query The track search query link
     * @param options The track search options
     * @returns RainlinkSearchResult
     */
    search(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            return yield this.manager.search(query, options);
        });
    }
    /**
     * Pause the track
     * @returns RainlinkPlayer
     */
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            if (this.paused == true)
                return this;
            yield this.node.rest.updatePlayer({
                guildId: this.guildId,
                playerOptions: {
                    paused: true,
                },
            });
            this.paused = true;
            this.playing = false;
            this.manager.emit(RainlinkEvents.PlayerPause, this, this.queue.current);
            return this;
        });
    }
    /**
     * Resume the track
     * @returns RainlinkPlayer
     */
    resume() {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            if (this.paused == false)
                return this;
            this.node.rest.updatePlayer({
                guildId: this.guildId,
                playerOptions: {
                    paused: false,
                },
            });
            this.paused = false;
            this.playing = true;
            this.manager.emit(RainlinkEvents.PlayerResume, this, this.queue.current);
            return this;
        });
    }
    /**
     * Pause or resume a track but different method
     * @param mode Whether to pause or not
     * @returns RainlinkPlayer
     */
    setPause(mode) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            if (this.paused == mode)
                return this;
            yield this.node.rest.updatePlayer({
                guildId: this.guildId,
                playerOptions: {
                    paused: mode,
                },
            });
            this.paused = mode;
            this.playing = !mode;
            this.manager.emit(mode ? RainlinkEvents.PlayerPause : RainlinkEvents.PlayerResume, this, this.queue.current);
            return this;
        });
    }
    /**
     * Play the previous track
     * @returns RainlinkPlayer
     */
    previous() {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            const prevoiusData = this.queue.previous;
            const current = this.queue.current;
            const index = prevoiusData.length - 1;
            if (index === -1 || !current)
                return this;
            yield this.play(prevoiusData[index]);
            this.queue.previous.splice(index, 1);
            return this;
        });
    }
    /**
     * Get all previous track
     * @returns RainlinkTrack[]
     */
    getPrevious() {
        this.checkDestroyed();
        return this.queue.previous;
    }
    /**
     * Skip the current track
     * @returns RainlinkPlayer
     */
    skip() {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            this.node.rest.updatePlayer({
                guildId: this.guildId,
                playerOptions: {
                    track: {
                        encoded: null,
                    },
                },
            });
            return this;
        });
    }
    /**
     * Seek to another position in track
     * @param position Position to seek
     * @returns RainlinkPlayer
     */
    seek(position) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            this.checkDestroyed();
            if (!this.queue.current)
                throw new Error("Player has no current track in it's queue");
            if (!this.queue.current.isSeekable)
                throw new Error("The current track isn't seekable");
            position = Number(position);
            if (isNaN(position))
                throw new Error("position must be a number");
            if (position < 0 || position > ((_a = this.queue.current.duration) !== null && _a !== void 0 ? _a : 0))
                position = Math.max(Math.min(position, (_b = this.queue.current.duration) !== null && _b !== void 0 ? _b : 0), 0);
            yield this.node.rest.updatePlayer({
                guildId: this.guildId,
                playerOptions: {
                    position: position,
                },
            });
            this.queue.current.position = position;
            return this;
        });
    }
    /**
     * Set another volume in player
     * @param volume Volume to cange
     * @returns RainlinkPlayer
     */
    setVolume(volume) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            if (isNaN(volume))
                throw new Error("volume must be a number");
            yield this.node.rest.updatePlayer({
                guildId: this.guildId,
                playerOptions: {
                    volume: volume,
                },
            });
            this.volume = volume;
            return this;
        });
    }
    /**
     * Set player to mute or unmute
     * @param enable Enable or not
     * @returns RainlinkPlayer
     */
    setMute(enable) {
        this.checkDestroyed();
        if (enable == this.mute)
            return this;
        this.mute = enable;
        this.sendVoiceUpdate();
        return this;
    }
    /**
     * Stop all avtivities and reset to default
     * @param destroy Whenever you want to destroy a player or not
     * @returns RainlinkPlayer
     */
    stop(destroy) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            if (destroy) {
                yield this.destroy();
                return this;
            }
            this.clear(false);
            this.node.rest.updatePlayer({
                guildId: this.guildId,
                playerOptions: {
                    track: {
                        encoded: null,
                    },
                },
            });
            this.manager.emit(RainlinkEvents.TrackEnd, this, this.queue.current);
            this.manager.emit(RainlinkEvents.PlayerStop, this);
            return this;
        });
    }
    /**
     * Reset all data to default
     * @param Whenever emit empty event or not
     * @inverval
     */
    clear(emitEmpty) {
        var _a;
        this.loop = RainlinkLoopMode.NONE;
        this.queue.clear();
        this.queue.current = undefined;
        this.queue.previous.length = 0;
        this.volume = (_a = this.manager.rainlinkOptions.options.defaultVolume) !== null && _a !== void 0 ? _a : 100;
        this.paused = true;
        this.playing = false;
        this.track = null;
        if (!this.data.get("sudo-destroy"))
            this.data.clear();
        this.position = 0;
        if (emitEmpty)
            this.manager.emit(RainlinkEvents.QueueEmpty, this);
        return;
    }
    /**
     * Set player to deaf or undeaf
     * @param enable Enable or not
     * @returns RainlinkPlayer
     */
    setDeaf(enable) {
        this.checkDestroyed();
        if (enable == this.deaf)
            return this;
        this.deaf = enable;
        this.sendVoiceUpdate();
        return this;
    }
    /**
     * Disconnect from the voice channel
     * @returns RainlinkPlayer
     */
    disconnect() {
        this.checkDestroyed();
        if (this.voiceState === VoiceConnectState.DISCONNECTED)
            return this;
        this.voiceId = null;
        this.deaf = false;
        this.mute = false;
        this.removeAllListeners();
        this.sendVoiceUpdate();
        this.voiceState = VoiceConnectState.DISCONNECTED;
        this.pause();
        this.state = RainlinkPlayerState.DISCONNECTED;
        this.debug(`Player disconnected; Guild id: ${this.guildId}`);
        return this;
    }
    /**
     * Connect from the voice channel
     * @returns RainlinkPlayer
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state === RainlinkPlayerState.CONNECTED || !this.voiceId)
                return this;
            if (this.voiceState === VoiceConnectState.CONNECTING || this.voiceState === VoiceConnectState.CONNECTED)
                return this;
            this.voiceState = VoiceConnectState.CONNECTING;
            this.sendVoiceUpdate();
            this.debugDiscord(`Requesting Connection | Guild: ${this.guildId}`);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), this.manager.rainlinkOptions.options.voiceConnectionTimeout);
            try {
                const [status] = yield RainlinkPlayer.once(this, "connectionUpdate", {
                    signal: controller.signal,
                });
                if (status !== VoiceState.SESSION_READY) {
                    switch (status) {
                        case VoiceState.SESSION_ID_MISSING:
                            throw new Error("The voice connection is not established due to missing session id");
                        case VoiceState.SESSION_ENDPOINT_MISSING:
                            throw new Error("The voice connection is not established due to missing connection endpoint");
                    }
                }
                this.voiceState = VoiceConnectState.CONNECTED;
            }
            catch (error) {
                this.debugDiscord(`Request Connection Failed | Guild: ${this.guildId}`);
                if (error.name === "AbortError")
                    throw new Error(`The voice connection is not established in ${this.manager.rainlinkOptions.options.voiceConnectionTimeout}ms`);
                throw error;
            }
            finally {
                clearTimeout(timeout);
                this.state = RainlinkPlayerState.CONNECTED;
                this.debug(`Player ${this.guildId} connected`);
            }
            return this;
        });
    }
    /**
     * Set text channel
     * @param textId Text channel ID
     * @returns RainlinkPlayer
     */
    setTextChannel(textId) {
        this.checkDestroyed();
        this.textId = textId;
        return this;
    }
    /**
     * Set voice channel and move the player to the voice channel
     * @param voiceId Voice channel ID
     * @returns RainlinkPlayer
     */
    setVoiceChannel(voiceId) {
        this.checkDestroyed();
        this.disconnect();
        this.voiceId = voiceId;
        this.connect();
        this.debugDiscord(`Player ${this.guildId} moved to voice channel ${voiceId}`);
        return this;
    }
    /**
     * Set a filter that prebuilt in rainlink
     * @param filter The filter name
     * @returns RainlinkPlayer
     */
    setFilter(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            const filterData = RainlinkFilterData[filter];
            if (!filterData)
                throw new Error("Filter not found");
            yield this.send({
                guildId: this.guildId,
                playerOptions: {
                    filters: filterData,
                },
            });
            return this;
        });
    }
    /**
     * Send custom player update data to lavalink server
     * @param data Data to change
     * @returns RainlinkPlayer
     */
    send(data) {
        this.checkDestroyed();
        this.node.rest.updatePlayer(data);
        return this;
    }
    debug(logs) {
        this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [Player @ ${this.guildId}] | ${logs}`);
    }
    debugDiscord(logs) {
        this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [Player @ ${this.guildId}] / [Voice] | ${logs}`);
    }
    checkDestroyed() {
        if (this.state === RainlinkPlayerState.DESTROYED)
            throw new Error("Player is destroyed");
    }
    /**
     * Send voice data to discord
     * @internal
     */
    sendVoiceUpdate() {
        this.sendDiscord({
            guild_id: this.guildId,
            channel_id: this.voiceId,
            self_deaf: this.deaf,
            self_mute: this.mute,
        });
    }
    /**
     * Send data to Discord
     * @param data The data to send
     * @internal
     */
    sendDiscord(data) {
        this.manager.library.sendPacket(this.shardId, { op: 4, d: data }, false);
    }
    /**
     * Sets the server update data for this connection
     * @internal
     */
    setServerUpdate(data) {
        var _a, _b;
        if (!data.endpoint) {
            this.emit("connectionUpdate", VoiceState.SESSION_ENDPOINT_MISSING);
            return;
        }
        if (!this.sessionId) {
            this.emit("connectionUpdate", VoiceState.SESSION_ID_MISSING);
            return;
        }
        this.lastRegion = ((_a = this.region) === null || _a === void 0 ? void 0 : _a.repeat(1)) || null;
        this.region = ((_b = data.endpoint.split(".").shift()) === null || _b === void 0 ? void 0 : _b.replace(/[0-9]/g, "")) || null;
        if (this.region && this.lastRegion !== this.region) {
            this.debugDiscord(`Voice Region Moved | Old Region: ${this.lastRegion} New Region: ${this.region} Guild: ${this.guildId}`);
        }
        this.serverUpdate = data;
        this.emit("connectionUpdate", VoiceState.SESSION_READY);
        this.debugDiscord(`Server Update Received | Server: ${this.region} Guild: ${this.guildId}`);
    }
    /**
     * Update Session ID, Channel ID, Deafen status and Mute status of this instance
     * @internal
     */
    setStateUpdate({ session_id, channel_id, self_deaf, self_mute }) {
        var _a;
        this.lastvoiceId = ((_a = this.voiceId) === null || _a === void 0 ? void 0 : _a.repeat(1)) || null;
        this.voiceId = channel_id || null;
        if (this.voiceId && this.lastvoiceId !== this.voiceId) {
            this.debugDiscord(`Channel Moved | Old Channel: ${this.voiceId} Guild: ${this.guildId}`);
        }
        if (!this.voiceId) {
            this.voiceState = VoiceConnectState.DISCONNECTED;
            this.debugDiscord(`Channel Disconnected | Guild: ${this.guildId}`);
        }
        this.deaf = self_deaf;
        this.mute = self_mute;
        this.sessionId = session_id || null;
        this.debugDiscord(`State Update Received | Channel: ${this.voiceId} Session ID: ${session_id} Guild: ${this.guildId}`);
    }
}
