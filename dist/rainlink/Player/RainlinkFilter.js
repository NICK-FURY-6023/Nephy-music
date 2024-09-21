var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import util from "node:util";
import { RainlinkEvents, RainlinkFilterData, RainlinkPlayerState } from "../Interface/Constants.js";
export class RainlinkFilter {
    constructor(player) {
        this.player = player;
    }
    /**
     * Set a filter that prebuilt in rainlink
     * @param filter The filter name
     * @returns RainlinkPlayer
     */
    set(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            const filterData = RainlinkFilterData[filter];
            if (!filterData) {
                this.debug(`Filter ${filter} not avaliable in Rainlink's filter prebuilt`);
                return this.player;
            }
            yield this.player.send({
                guildId: this.player.guildId,
                playerOptions: {
                    filters: filterData,
                },
            });
            this.debug(filter !== "clear"
                ? `${filter} filter has been successfully set.`
                : "All filters have been successfully reset to their default positions.");
            return this.player;
        });
    }
    /**
     * Clear all the filter
     * @returns RainlinkPlayer
     */
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            yield this.player.send({
                guildId: this.player.guildId,
                playerOptions: {
                    filters: {},
                },
            });
            this.debug("All filters have been successfully reset to their default positions.");
            return this.player;
        });
    }
    /**
     * Sets the filter volume of the player
     * @param volume Target volume 0.0-5.0
     */
    setVolume(volume) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setRaw({ volume });
        });
    }
    /**
     * Change the equalizer settings applied to the currently playing track
     * @param equalizer An array of objects that conforms to the Bands type that define volumes at different frequencies
     */
    setEqualizer(equalizer) {
        return this.setRaw({ equalizer });
    }
    /**
     * Change the karaoke settings applied to the currently playing track
     * @param karaoke An object that conforms to the KaraokeSettings type that defines a range of frequencies to mute
     */
    setKaraoke(karaoke) {
        return this.setRaw({ karaoke: karaoke || null });
    }
    /**
     * Change the timescale settings applied to the currently playing track
     * @param timescale An object that conforms to the TimescaleSettings type that defines the time signature to play the audio at
     */
    setTimescale(timescale) {
        return this.setRaw({ timescale: timescale || null });
    }
    /**
     * Change the tremolo settings applied to the currently playing track
     * @param tremolo An object that conforms to the FreqSettings type that defines an oscillation in volume
     */
    setTremolo(tremolo) {
        return this.setRaw({ tremolo: tremolo || null });
    }
    /**
     * Change the vibrato settings applied to the currently playing track
     * @param vibrato An object that conforms to the FreqSettings type that defines an oscillation in pitch
     */
    setVibrato(vibrato) {
        return this.setRaw({ vibrato: vibrato || null });
    }
    /**
     * Change the rotation settings applied to the currently playing track
     * @param rotation An object that conforms to the RotationSettings type that defines the frequency of audio rotating round the listener
     */
    setRotation(rotation) {
        return this.setRaw({ rotation: rotation || null });
    }
    /**
     * Change the distortion settings applied to the currently playing track
     * @param distortion An object that conforms to DistortionSettings that defines distortions in the audio
     * @returns The current player instance
     */
    setDistortion(distortion) {
        return this.setRaw({ distortion: distortion || null });
    }
    /**
     * Change the channel mix settings applied to the currently playing track
     * @param channelMix An object that conforms to ChannelMixSettings that defines how much the left and right channels affect each other (setting all factors to 0.5 causes both channels to get the same audio)
     */
    setChannelMix(channelMix) {
        return this.setRaw({ channelMix: channelMix || null });
    }
    /**
     * Change the low pass settings applied to the currently playing track
     * @param lowPass An object that conforms to LowPassSettings that defines the amount of suppression on higher frequencies
     */
    setLowPass(lowPass) {
        return this.setRaw({ lowPass: lowPass || null });
    }
    /**
     * Set a custom filter
     * @param filter The filter name
     * @returns RainlinkPlayer
     */
    setRaw(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            yield this.player.send({
                guildId: this.player.guildId,
                playerOptions: {
                    filters: filter,
                },
            });
            this.debug("Custom filter has been successfully set. Data: " + util.inspect(filter));
            return this.player;
        });
    }
    debug(logs) {
        this.player.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [Player @ ${this.player.guildId}] / [Filter] | ${logs}`);
    }
    checkDestroyed() {
        if (this.player.state === RainlinkPlayerState.DESTROYED)
            throw new Error("Player is destroyed");
    }
}
