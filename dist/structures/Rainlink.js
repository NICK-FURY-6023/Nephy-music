import { Library, Plugin, Rainlink } from "../rainlink/main.js";
export class RainlinkInit {
    constructor(client) {
        this.client = client;
    }
    get init() {
        return new Rainlink({
            library: new Library.DiscordJS(this.client),
            nodes: this.client.config.lavalink.NODES,
            plugins: this.plugins,
            options: this.client.config.features.AUTOFIX_LAVALINK.enable ? this.autofixConfig : this.defaultConfig,
        });
    }
    get defaultConfig() {
        return {
            resume: true,
            resumeTimeout: 600,
            retryCount: Infinity,
            retryTimeout: 3000,
            searchFallback: {
                enable: true,
                engine: "youtube",
            },
        };
    }
    get autofixConfig() {
        return {
            retryCount: this.client.config.features.AUTOFIX_LAVALINK.retryCount,
            retryTimeout: this.client.config.features.AUTOFIX_LAVALINK.retryTimeout,
        };
    }
    get plugins() {
        const defaultPlugins = [
            new Plugin.Deezer(),
            new Plugin.Nico({ searchLimit: 10 }),
            new Plugin.Apple({ countryCode: "us" }),
        ];
        if (this.client.config.lavalink.AVOID_SUSPEND)
            defaultPlugins.push(new Plugin.YoutubeConverter({
                sources: ["scsearch"],
            }));
        if (this.client.config.lavalink.SPOTIFY.enable)
            defaultPlugins.push(new Plugin.Spotify({
                clientId: this.client.config.lavalink.SPOTIFY.id,
                clientSecret: this.client.config.lavalink.SPOTIFY.secret,
                playlistPageLimit: 1,
                albumPageLimit: 1,
                searchLimit: 10,
            }));
        return defaultPlugins;
    }
}
