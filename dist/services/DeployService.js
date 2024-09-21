var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fileURLToPath, pathToFileURL } from "url";
import chillout from "chillout";
import path from "path";
import readdirRecursive from "recursive-readdir";
import { ApplicationCommandOptionType, REST, Routes } from "discord.js";
import { join, dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
export class DeployService {
    constructor(client) {
        this.client = client;
        this.execute();
    }
    combineDir() {
        return __awaiter(this, void 0, void 0, function* () {
            const store = [];
            const interactionsFolder = path.resolve(join(__dirname, "..", "commands"));
            let interactionFilePaths = yield readdirRecursive(interactionsFolder);
            interactionFilePaths = interactionFilePaths.filter((i) => {
                let state = path.basename(i).startsWith("-");
                return !state;
            });
            yield chillout.forEach(interactionFilePaths, (interactionFilePath) => __awaiter(this, void 0, void 0, function* () {
                const cmd = new (yield import(pathToFileURL(interactionFilePath).toString())).default();
                cmd.usingInteraction ? store.push(cmd) : true;
                return;
            }));
            return store;
        });
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const command = [];
            this.client.logger.info(DeployService.name, "Reading interaction files...");
            const store = yield this.combineDir();
            command.push(...this.parseEngine(store));
            this.client.logger.info(DeployService.name, "Reading interaction files completed, setting up REST...");
            const rest = new REST({ version: "10" }).setToken(this.client.config.bot.TOKEN);
            const client = yield rest.get(Routes.user());
            this.client.logger.info(DeployService.name, `Setting up REST completed! Account information received! ${client.username}#${client.discriminator} (${client.id})`);
            if (command.length === 0)
                return this.client.logger.info(DeployService.name, "No interactions loaded. Exiting auto deploy...");
            yield rest.put(Routes.applicationCommands(client.id), {
                body: command,
            });
            this.client.logger.info(DeployService.name, `Interactions deployed! Exiting auto deploy...`);
        });
    }
    parseEngine(store) {
        return store.reduce((all, current) => this.commandReducer(all, current), []);
    }
    commandReducer(all, current) {
        // Push single name command
        if (current.name.length == 1)
            all.push(this.singleCommandMaker(current));
        // Push double name command
        if (current.name.length == 2) {
            let baseItem = all.find((i) => {
                return i.name == current.name[0] && i.type == current.type;
            });
            if (!baseItem)
                all.push(this.doubleCommandMaker(current));
            else
                baseItem.options.push(this.singleItemMaker(current, 1));
        }
        // Push trible name command
        if (current.name.length == 3) {
            let SubItem = all.find((i) => {
                return i.name == current.name[0] && i.type == current.type;
            });
            let GroupItem = SubItem
                ? SubItem.options.find((i) => {
                    return (i.name == current.name[1] && i.type == ApplicationCommandOptionType.SubcommandGroup);
                })
                : undefined;
            if (!SubItem) {
                all.push(this.tribleCommandMaker(current));
            }
            else if (SubItem && !GroupItem) {
                SubItem.options.push(this.doubleSubCommandMaker(current));
            }
            else if (SubItem && GroupItem) {
                GroupItem.options.push(this.singleItemMaker(current, 2));
            }
        }
        // Return all
        return all;
    }
    singleCommandMaker(current) {
        return {
            type: current.type,
            name: current.name[0],
            description: current.description,
            defaultPermission: current.defaultPermission,
            options: current.options,
        };
    }
    doubleCommandMaker(current) {
        return {
            type: current.type,
            name: current.name[0],
            description: `${current.name[0]} commands.`,
            defaultPermission: current.defaultPermission,
            options: [this.singleItemMaker(current, 1)],
        };
    }
    singleItemMaker(current, nameIndex) {
        return {
            type: ApplicationCommandOptionType.Subcommand,
            description: current.description,
            name: current.name[nameIndex],
            options: current.options,
        };
    }
    tribleCommandMaker(current) {
        return {
            type: current.type,
            name: current.name[0],
            description: `${current.name[0]} commands.`,
            defaultPermission: current.defaultPermission,
            options: [
                {
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    description: `${current.name[1]} commands.`,
                    name: current.name[1],
                    options: [this.singleItemMaker(current, 2)],
                },
            ],
        };
    }
    doubleSubCommandMaker(current) {
        return {
            type: ApplicationCommandOptionType.SubcommandGroup,
            description: `${current.name[1]} commands.`,
            name: current.name[1],
            options: [this.singleItemMaker(current, 2)],
        };
    }
}
