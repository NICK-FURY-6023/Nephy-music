export function getTitle(client, track) {
    if (client.config.player.AVOID_SUSPEND)
        return track.title;
    return `[${track.title}](${track.uri})`;
}
