var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CheckLavalinkServer } from './CheckLavalinkServer.js';
import chalk from 'chalk';
export class AutoFixLavalink {
    constructor(client, lavalinkName) {
        this.client = client;
        this.lavalinkName = lavalinkName;
        this.execute();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.logger.info(AutoFixLavalink.name, '----- Starting autofix lavalink... -----');
            if (this.client.lavalinkList.length == 0) {
                new CheckLavalinkServer(this.client);
                return this.fixLavalink();
            }
            else
                return this.fixLavalink();
        });
    }
    fixLavalink() {
        return __awaiter(this, void 0, void 0, function* () {
            const autofixError = chalk.hex('#e12885');
            const autofixErrorMess = autofixError('Error: ');
            this.checkLavalink();
            yield this.removeCurrentLavalink();
            if (this.client.lavalinkList.filter((i) => i.online).length == 0) {
                this.client.logger.info(AutoFixLavalink.name, autofixErrorMess + 'No lavalink online or avalible for this bot.');
                this.client.logger.info(AutoFixLavalink.name, autofixErrorMess +
                    'Please shutdown the bot, enter the valid lavalink server (v4) and reboot the bot');
                this.client.logger.info(AutoFixLavalink.name, '----- Terminated autofix lavalink. -----');
                return;
            }
            yield this.applyNewLavalink();
            this.client.logger.info(AutoFixLavalink.name, 'Now used new lavalink, please wait 1 second to make it connect.');
            this.client.logger.info(AutoFixLavalink.name, '----- Terminated autofix lavalink. -----');
        });
    }
    checkLavalink() {
        if (this.client.rainlink.nodes.size !== 0 && this.client.lavalinkUsing.length == 0) {
            this.client.rainlink.nodes.forEach((data, index) => {
                this.client.lavalinkUsing.push({
                    host: data.options.host,
                    port: data.options.port,
                    pass: data.options.auth,
                    secure: data.options.secure,
                    name: index,
                });
            });
        }
    }
    removeCurrentLavalink() {
        return __awaiter(this, void 0, void 0, function* () {
            const lavalinkIndex = this.client.lavalinkUsing.findIndex((data) => data.name == this.lavalinkName);
            const targetLavalink = this.client.lavalinkUsing[lavalinkIndex];
            if (this.client.rainlink.nodes.size == 0 && this.client.lavalinkUsing.length != 0) {
                this.client.lavalinkUsing.splice(lavalinkIndex, 1);
            }
            else if (this.client.rainlink.nodes.size !== 0 && this.client.lavalinkUsing.length !== 0) {
                const isLavalinkExist = this.client.rainlink.nodes.get(targetLavalink.name);
                if (isLavalinkExist)
                    this.client.rainlink.nodes.remove(targetLavalink.name);
                this.client.lavalinkUsing.splice(lavalinkIndex, 1);
            }
        });
    }
    applyNewLavalink() {
        return __awaiter(this, void 0, void 0, function* () {
            const onlineList = [];
            this.client.lavalinkList.filter((data) => __awaiter(this, void 0, void 0, function* () {
                if (data.online == true)
                    return onlineList.push(data);
            }));
            const nodeInfo = onlineList[Math.floor(Math.random() * onlineList.length)];
            this.client.rainlink.nodes.add({
                port: nodeInfo.port,
                host: nodeInfo.host,
                auth: nodeInfo.pass,
                name: nodeInfo.name,
                secure: nodeInfo.secure,
            });
            return nodeInfo;
        });
    }
}
