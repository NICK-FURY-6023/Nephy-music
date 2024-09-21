export class WebsocketRoute {
    constructor(client) {
        this.client = client;
    }
    main(fastify) {
        fastify.get("/websocket", { websocket: true }, (socket, req) => {
            this.client.logger.info(WebsocketRoute.name, `${req.method} ${req.routeOptions.url}`);
            socket.on("close", (code, reason) => {
                this.client.logger.info(WebsocketRoute.name, `Closed with code: ${code}, reason: ${reason}`);
            });
            if (!this.checker(socket, req))
                return;
            this.client.wsl.set(String(req.headers["guild-id"]), {
                send: (data) => socket.send(JSON.stringify(data)),
            });
            this.client.logger.info(WebsocketRoute.name, `Websocket opened for guildId: ${req.headers["guild-id"]}`);
        });
    }
    checker(socket, req) {
        if (!req.headers["guild-id"]) {
            socket.send(JSON.stringify({ error: "Missing guild-id" }));
            socket.close(1000, JSON.stringify({ error: "Missing guild-id" }));
            return false;
        }
        if (!req.headers["authorization"]) {
            socket.send(JSON.stringify({ error: "Missing Authorization" }));
            socket.close(1000, JSON.stringify({ error: "Missing Authorization" }));
            return false;
        }
        if (req.headers["authorization"] !== this.client.config.utilities.WEB_SERVER.auth) {
            socket.send(JSON.stringify({ error: "Authorization failed" }));
            socket.close(1000, JSON.stringify({ error: "Authorization failed" }));
            return false;
        }
        if (this.client.wsl.get(String(req.headers["guild-id"]))) {
            socket.send(JSON.stringify({ error: "Alreary hae connection on this guild" }));
            socket.close(1000, JSON.stringify({ error: "Alreary hae connection on this guild" }));
            return false;
        }
        return true;
    }
}
