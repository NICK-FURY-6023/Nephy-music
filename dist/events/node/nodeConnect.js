export default class {
    execute(client, node) {
        client.rainlink.nodes.forEach((data, index) => {
            client.lavalinkUsing.push({
                host: data.options.host,
                port: Number(data.options.port) | 0,
                pass: data.options.auth,
                secure: data.options.secure,
                name: index,
            });
        });
        client.logger.info(import.meta.url, `Lavalink [${node.options.name}] connected.`);
    }
}
