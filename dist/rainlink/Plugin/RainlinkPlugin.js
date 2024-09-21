/** The interface class for another rainlink plugin, extend it to use */
export class RainlinkPlugin {
    /** Name function for getting plugin name */
    name() {
        throw new Error("Plugin must implement name() and return a plguin name string");
    }
    /** Type function for diferent type of plugin */
    type() {
        throw new Error('Plugin must implement type() and return "sourceResolver" or "default"');
    }
    /** Load function for make the plugin working */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    load(manager) {
        throw new Error("Plugin must implement load()");
    }
    /** unload function for make the plugin stop working */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unload(manager) {
        throw new Error("Plugin must implement unload()");
    }
}
