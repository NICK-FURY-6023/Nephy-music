var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createLogger, transports, format } from "winston";
const { timestamp, prettyPrint, printf } = format;
import { fileURLToPath } from "url";
import chalk from "chalk";
import util from "node:util";
import { EmbedBuilder } from "discord.js";
export class LoggerService {
    constructor(client) {
        this.client = client;
        this.padding = 22;
        this.preLog = createLogger({
            levels: {
                error: 0,
                warn: 1,
                info: 2,
                websocket: 3,
                lavalink: 4,
                loader: 5,
                setup: 6,
                deploy: 7,
                debug: 8,
                unhandled: 9,
            },
            transports: [
                new transports.Console({
                    level: "unhandled",
                    format: this.consoleFormat,
                }),
                new transports.File({
                    level: "unhandled",
                    filename: "./logs/byteblaze.log",
                    format: this.fileFormat,
                }),
            ],
        });
    }
    info(file, msg) {
        return this.preLog.log({
            level: "info",
            message: `${fileURLToPath(file)
                .replace(/^.*[\\\/]/, "")
                .padEnd(this.padding)} - ${msg}`,
        });
    }
    debug(file, msg) {
        const fileName = fileURLToPath(file)
            .replace(/^.*[\\\/]/, "")
            .padEnd(this.padding);
        this.preLog.log({
            level: "debug",
            message: `${fileName} - ${msg}`,
        });
        return;
    }
    warn(file, msg) {
        const fileName = fileURLToPath(file)
            .replace(/^.*[\\\/]/, "")
            .padEnd(this.padding);
        this.preLog.log({
            level: "warn",
            message: `${fileName} - ${msg}`,
        });
        this.sendDiscord("warning", msg, fileName);
        return;
    }
    error(file, msg) {
        const fileName = fileURLToPath(file)
            .replace(/^.*[\\\/]/, "")
            .padEnd(this.padding);
        this.preLog.log({
            level: "error",
            message: `${fileName} - ${util.inspect(msg)}`,
        });
        this.sendDiscord("error", util.inspect(msg), fileName);
        return;
    }
    lavalink(file, msg) {
        return this.preLog.log({
            level: "lavalink",
            message: `${fileURLToPath(file)
                .replace(/^.*[\\\/]/, "")
                .padEnd(this.padding)} - ${msg}`,
        });
    }
    loader(file, msg) {
        return this.preLog.log({
            level: "loader",
            message: `${fileURLToPath(file)
                .replace(/^.*[\\\/]/, "")
                .padEnd(this.padding)} - ${msg}`,
        });
    }
    setup(file, msg) {
        return this.preLog.log({
            level: "setup",
            message: `${fileURLToPath(file)
                .replace(/^.*[\\\/]/, "")
                .padEnd(this.padding)} - ${msg}`,
        });
    }
    websocket(file, msg) {
        return this.preLog.log({
            level: "websocket",
            message: `${fileURLToPath(file)
                .replace(/^.*[\\\/]/, "")
                .padEnd(this.padding)} - ${msg}`,
        });
    }
    deploy(file, msg) {
        return this.preLog.log({
            level: "deploy",
            message: `${fileURLToPath(file)
                .replace(/^.*[\\\/]/, "")
                .padEnd(this.padding)} - ${msg}`,
        });
    }
    unhandled(file, msg) {
        const fileName = fileURLToPath(file)
            .replace(/^.*[\\\/]/, "")
            .padEnd(this.padding);
        this.preLog.log({
            level: "unhandled",
            message: `${fileName} - ${util.inspect(msg)}`,
        });
        this.sendDiscord("unhandled", util.inspect(msg), fileName);
        return;
    }
    filter(info) {
        const pad = 9;
        switch (info.level) {
            case "info":
                return chalk.hex("#00CFF0")(info.level.toUpperCase().padEnd(pad));
            case "debug":
                return chalk.hex("#F5A900")(info.level.toUpperCase().padEnd(pad));
            case "warn":
                return chalk.hex("#FBEC5D")(info.level.toUpperCase().padEnd(pad));
            case "error":
                return chalk.hex("#e12885")(info.level.toUpperCase().padEnd(pad));
            case "lavalink":
                return chalk.hex("#ffc61c")(info.level.toUpperCase().padEnd(pad));
            case "loader":
                return chalk.hex("#4402f7")(info.level.toUpperCase().padEnd(pad));
            case "setup":
                return chalk.hex("#f7f702")(info.level.toUpperCase().padEnd(pad));
            case "websocket":
                return chalk.hex("#00D100")(info.level.toUpperCase().padEnd(pad));
            case "deploy":
                return chalk.hex("#7289da")(info.level.toUpperCase().padEnd(pad));
            case "unhandled":
                return chalk.hex("#ff0000")(info.level.toUpperCase().padEnd(pad));
        }
    }
    get consoleFormat() {
        return format.combine(timestamp(), printf((info) => {
            return `${chalk.hex("#00ddc0")(info.timestamp)} - ${this.filter(info)} - ${chalk.hex("#86cecb")(info.message)}`;
        }));
    }
    get fileFormat() {
        return format.combine(timestamp(), prettyPrint());
    }
    sendDiscord(type, message, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelId = this.client.config.features.LOG_CHANNEL;
            if (!channelId || channelId.length == 0)
                return;
            try {
                const channel = (yield this.client.channels.fetch(channelId).catch(() => undefined));
                if (!channel || !channel.isTextBased())
                    return;
                let embed = null;
                if (message.length > 4096) {
                    embed = new EmbedBuilder()
                        .setDescription("Logs too long to display! please check your host!")
                        .setTitle(`${type} from ${file}`)
                        .setColor(this.client.color);
                }
                else {
                    embed = new EmbedBuilder().setDescription(message).setTitle(`${type} from ${file}`).setColor(this.client.color);
                }
                yield channel.messages.channel.send({ embeds: [embed] });
            }
            catch (err) { }
        });
    }
}
