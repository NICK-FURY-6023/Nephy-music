import { createLogger, transports, format, Logger } from "winston";
const { timestamp, prettyPrint, printf } = format;
import { fileURLToPath } from "url";
import chalk from "chalk";
import util from "node:util";
import { Manager } from "../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";

type InfoDataType = {
  message: string;
  level: string;
  timestamp?: string;
};

export class LoggerService {
  private preLog: Logger;
  private padding = 22;
  constructor(private client: Manager) {
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

  public info(file: string, msg: string) {
    return this.preLog.log({
      level: "info",
      message: `${fileURLToPath(file)
        .replace(/^.*[\\\/]/, "")
        .padEnd(this.padding)} - ${msg}`,
    });
  }

  public debug(file: string, msg: string) {
    const fileName = fileURLToPath(file)
      .replace(/^.*[\\\/]/, "")
      .padEnd(this.padding);
    this.preLog.log({
      level: "debug",
      message: `${fileName} - ${msg}`,
    });
    return;
  }

  public warn(file: string, msg: string) {
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

  public error(file: string, msg: unknown) {
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

  public lavalink(file: string, msg: string) {
    return this.preLog.log({
      level: "lavalink",
      message: `${fileURLToPath(file)
        .replace(/^.*[\\\/]/, "")
        .padEnd(this.padding)} - ${msg}`,
    });
  }

  public loader(file: string, msg: string) {
    return this.preLog.log({
      level: "loader",
      message: `${fileURLToPath(file)
        .replace(/^.*[\\\/]/, "")
        .padEnd(this.padding)} - ${msg}`,
    });
  }

  public setup(file: string, msg: string) {
    return this.preLog.log({
      level: "setup",
      message: `${fileURLToPath(file)
        .replace(/^.*[\\\/]/, "")
        .padEnd(this.padding)} - ${msg}`,
    });
  }

  public websocket(file: string, msg: string) {
    return this.preLog.log({
      level: "websocket",
      message: `${fileURLToPath(file)
        .replace(/^.*[\\\/]/, "")
        .padEnd(this.padding)} - ${msg}`,
    });
  }

  public deploy(file: string, msg: string) {
    return this.preLog.log({
      level: "deploy",
      message: `${fileURLToPath(file)
        .replace(/^.*[\\\/]/, "")
        .padEnd(this.padding)} - ${msg}`,
    });
  }

  public unhandled(file: string, msg: unknown) {
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

  private filter(info: InfoDataType) {
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

  private get consoleFormat() {
    return format.combine(
      timestamp(),
      printf((info: InfoDataType) => {
        return `${chalk.hex("#00ddc0")(info.timestamp)} - ${this.filter(info)} - ${chalk.hex("#86cecb")(info.message)}`;
      })
    );
  }

  private get fileFormat() {
    return format.combine(timestamp(), prettyPrint());
  }

  private async sendDiscord(type: string, message: string, file: string) {
    const channelId = this.client.config.features.LOG_CHANNEL;
    if (!channelId || channelId.length == 0) return;
    try {
      const channel = (await this.client.channels.fetch(channelId).catch(() => undefined)) as TextChannel;
      if (!channel || !channel.isTextBased()) return;
      let embed = null;
      if (message.length > 4096) {
        embed = new EmbedBuilder()
          .setDescription("Logs too long to display! please check your host!")
          .setTitle(`${type} from ${file}`)
          .setColor(this.client.color);
      } else {
        embed = new EmbedBuilder().setDescription(message).setTitle(`${type} from ${file}`).setColor(this.client.color);
      }

      await channel.messages.channel.send({ embeds: [embed] });
    } catch (err) {}
  }
}
