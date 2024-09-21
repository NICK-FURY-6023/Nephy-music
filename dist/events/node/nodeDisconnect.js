export default class {
    execute(client, node, code, reason) {
        client.rainlink.players.forEach((player, index) => {
            if (player.node.options.name == node.options.name)
                player.destroy();
        });
        client.logger.debug(import.meta.url, `Lavalink ${node.options.name}: Disconnected, Code: ${code}, Reason: ${reason}`);
    }
}
